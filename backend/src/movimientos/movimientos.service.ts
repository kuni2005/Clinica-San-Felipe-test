import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MovimientoCab } from './entities/movimiento-cab.entity';
import { MovimientoDet } from './entities/movimiento-det.entity';
import { Producto } from '../productos/entities/producto.entity';

export interface KardexItem {
  id_producto: number;
  nombre_producto: string;
  stock_actual: number;
  costo: number;
  precio_venta: number;
}

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(MovimientoCab)
    private readonly cabRepo: Repository<MovimientoCab>,
    @InjectRepository(MovimientoDet)
    private readonly detRepo: Repository<MovimientoDet>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  async getStockProducto(
    id_producto: number,
    manager?: EntityManager,
  ): Promise<number> {
    const repo = manager ? manager.getRepository(MovimientoDet) : this.detRepo;

    const result = await repo
      .createQueryBuilder('det')
      .innerJoin('det.movimientoCab', 'cab')
      .where('det.id_producto = :id_producto', { id_producto })
      .select(
        'SUM(CASE WHEN cab.id_tipo_movimiento = 1 THEN CAST(det.cantidad AS FLOAT) ELSE 0 END)',
        'entradas',
      )
      .addSelect(
        'SUM(CASE WHEN cab.id_tipo_movimiento = 2 THEN CAST(det.cantidad AS FLOAT) ELSE 0 END)',
        'salidas',
      )
      .getRawOne();

    const entradas = parseFloat(result?.entradas || '0');
    const salidas = parseFloat(result?.salidas || '0');
    return entradas - salidas;
  }

  async getKardex(): Promise<KardexItem[]> {
    const productos = await this.productoRepo.find({
      order: { id_producto: 'ASC' },
    });

    return Promise.all(
      productos.map(async (p) => ({
        id_producto: p.id_producto,
        nombre_producto: p.nombre_producto,
        stock_actual: await this.getStockProducto(p.id_producto),
        costo: Number(p.costo),
        precio_venta: Number(p.precio_venta),
      })),
    );
  }

  async getMovimientosByProducto(id_producto: number) {
    const cabs = await this.cabRepo
      .createQueryBuilder('cab')
      .innerJoin('cab.detalles', 'filtro')
      .where('filtro.id_producto = :id_producto', { id_producto })
      .leftJoinAndSelect('cab.detalles', 'det')
      .orderBy('cab.fec_registro', 'DESC')
      .getMany();

    return cabs.map((cab) => ({
      ...cab,
      tipo_nombre: cab.id_tipo_movimiento === 1 ? 'Entrada' : 'Salida',
    }));
  }
}
