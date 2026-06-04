import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LogOperation } from '../common/decorators/log-operation.decorator';
import { VentaCab } from './entities/venta-cab.entity';
import { VentaDet } from './entities/venta-det.entity';
import { Producto } from '../productos/entities/producto.entity';
import { MovimientoCab } from '../movimientos/entities/movimiento-cab.entity';
import { MovimientoDet } from '../movimientos/entities/movimiento-det.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentasService } from './ventas.service';

const IGV_RATE = 0.18;

/**
 * Facade pattern: orquesta validación de stock + VentaCab + VentaDet
 * + MovimientoCab tipo 2 (Salida) en una sola transacción.
 */
@Injectable()
export class VentasFacade {
  constructor(
    private readonly dataSource: DataSource,
    private readonly ventasService: VentasService,
  ) {}

  @LogOperation('registrar-venta')
  async registrarVenta(dto: CreateVentaDto): Promise<VentaCab> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const mgr = qr.manager;

      // ── 1. Validar stock y obtener precios de venta ──────────────────
      const detallesEnriquecidos: Array<{
        id_producto: number;
        cantidad: number;
        precio: number;
        subTotal: number;
      }> = [];

      let headerSubTotal = 0;

      for (const d of dto.detalles) {
        // Obtener producto (valida existencia)
        const producto = await mgr.findOne(Producto, {
          where: { id_producto: d.id_producto },
        });
        if (!producto)
          throw new NotFoundException(`Producto #${d.id_producto} no encontrado`);

        // Calcular stock actual desde movimientos
        const stockRes = await mgr
          .createQueryBuilder(MovimientoDet, 'det')
          .innerJoin('det.movimientoCab', 'cab')
          .where('det.id_producto = :id', { id: d.id_producto })
          .select(
            'SUM(CASE WHEN cab.id_tipo_movimiento = 1 THEN CAST(det.cantidad AS FLOAT) ELSE 0 END)',
            'entradas',
          )
          .addSelect(
            'SUM(CASE WHEN cab.id_tipo_movimiento = 2 THEN CAST(det.cantidad AS FLOAT) ELSE 0 END)',
            'salidas',
          )
          .getRawOne();

        const stock =
          parseFloat(stockRes?.entradas || '0') -
          parseFloat(stockRes?.salidas || '0');

        if (d.cantidad > stock) {
          throw new BadRequestException(
            `Stock insuficiente para "${producto.nombre_producto}". ` +
              `Disponible: ${stock}, Solicitado: ${d.cantidad}`,
          );
        }

        const precio = Number(producto.precio_venta);
        const subTotal = parseFloat((d.cantidad * precio).toFixed(2));
        headerSubTotal += subTotal;

        detallesEnriquecidos.push({
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio,
          subTotal,
        });
      }

      const headerIgv = parseFloat((headerSubTotal * IGV_RATE).toFixed(2));
      const headerTotal = parseFloat((headerSubTotal + headerIgv).toFixed(2));

      // ── 2. Guardar VentaCab ─────────────────────────────────────────
      const cab = mgr.create(VentaCab, {
        sub_total: headerSubTotal,
        igv: headerIgv,
        total: headerTotal,
      });
      const savedCab = await mgr.save(VentaCab, cab);

      // ── 3. Guardar VentaDet ─────────────────────────────────────────
      for (const d of detallesEnriquecidos) {
        const igv = parseFloat((d.subTotal * IGV_RATE).toFixed(2));
        const total = parseFloat((d.subTotal + igv).toFixed(2));

        const det = mgr.create(VentaDet, {
          id_venta_cab: savedCab.id_venta_cab,
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio: d.precio,
          sub_total: d.subTotal,
          igv,
          total,
        });
        await mgr.save(VentaDet, det);
      }

      // ── 4. Generar MovimientoCab tipo 2 (Salida) ────────────────────
      const movCab = mgr.create(MovimientoCab, {
        id_tipo_movimiento: 2,
        id_documento_origen: savedCab.id_venta_cab,
      });
      const savedMovCab = await mgr.save(MovimientoCab, movCab);

      // ── 5. Generar MovimientoDet ────────────────────────────────────
      for (const d of detallesEnriquecidos) {
        const movDet = mgr.create(MovimientoDet, {
          id_movimiento_cab: savedMovCab.id_movimiento_cab,
          id_producto: d.id_producto,
          cantidad: d.cantidad,
        });
        await mgr.save(MovimientoDet, movDet);
      }

      await qr.commitTransaction();
      return savedCab;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  listarVentas() {
    return this.ventasService.findAll();
  }
}
