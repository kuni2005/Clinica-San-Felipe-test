import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LogOperation } from '../common/decorators/log-operation.decorator';
import { CompraCab } from './entities/compra-cab.entity';
import { CompraDet } from './entities/compra-det.entity';
import { Producto } from '../productos/entities/producto.entity';
import { MovimientoCab } from '../movimientos/entities/movimiento-cab.entity';
import { MovimientoDet } from '../movimientos/entities/movimiento-det.entity';
import { CreateCompraDto } from './dto/create-compra.dto';
import { ComprasService } from './compras.service';

const IGV_RATE = 0.18;

/**
 * Facade pattern: orquesta CompraCab + CompraDet + Producto + Movimiento
 * dentro de una sola transacción atómica.
 */
@Injectable()
export class ComprasFacade {
  constructor(
    private readonly dataSource: DataSource,
    private readonly comprasService: ComprasService,
  ) {}

  @LogOperation('registrar-compra')
  async registrarCompra(dto: CreateCompraDto): Promise<CompraCab> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const mgr = qr.manager;

      // ── 1. Calcular totales de cabecera ──────────────────────────────
      let headerSubTotal = 0;
      for (const d of dto.detalles) {
        headerSubTotal += d.cantidad * d.precio;
      }
      const headerIgv = parseFloat((headerSubTotal * IGV_RATE).toFixed(2));
      const headerTotal = parseFloat((headerSubTotal + headerIgv).toFixed(2));

      // ── 2. Guardar CompraCab ─────────────────────────────────────────
      const cab = mgr.create(CompraCab, {
        sub_total: headerSubTotal,
        igv: headerIgv,
        total: headerTotal,
      });
      const savedCab = await mgr.save(CompraCab, cab);

      // ── 3. Guardar CompraDet + actualizar precio_venta del producto ──
      for (const d of dto.detalles) {
        const subTotal = parseFloat((d.cantidad * d.precio).toFixed(2));
        const igv = parseFloat((subTotal * IGV_RATE).toFixed(2));
        const total = parseFloat((subTotal + igv).toFixed(2));

        const det = mgr.create(CompraDet, {
          id_compra_cab: savedCab.id_compra_cab,
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio: d.precio,
          sub_total: subTotal,
          igv,
          total,
        });
        await mgr.save(CompraDet, det);

        // Actualizar costo y precio_venta = costo * 1.35
        await mgr.update(Producto, d.id_producto, {
          costo: d.precio,
          precio_venta: parseFloat((d.precio * 1.35).toFixed(2)),
        });
      }

      // ── 4. Generar MovimientoCab tipo 1 (Entrada) ───────────────────
      const movCab = mgr.create(MovimientoCab, {
        id_tipo_movimiento: 1,
        id_documento_origen: savedCab.id_compra_cab,
      });
      const savedMovCab = await mgr.save(MovimientoCab, movCab);

      // ── 5. Generar MovimientoDet ─────────────────────────────────────
      for (const d of dto.detalles) {
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

  listarCompras() {
    return this.comprasService.findAll();
  }
}
