import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { IProductosService } from './interfaces/productos-service.interface';

@Injectable()
export class ProductosService implements IProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly repo: Repository<Producto>,
  ) {}

  async findAll(): Promise<Producto[]> {
    return this.repo.find({ order: { id_producto: 'ASC' } });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.repo.findOne({ where: { id_producto: id } });
    if (!producto) throw new NotFoundException(`Producto #${id} no encontrado`);
    return producto;
  }

  async create(dto: CreateProductoDto): Promise<Producto> {
    const producto = this.repo.create(dto);
    return this.repo.save(producto);
  }

  async update(id: number, dto: UpdateProductoDto): Promise<Producto> {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async actualizarCostoYPrecio(
    id: number,
    costo: number,
    manager?: EntityManager,
  ): Promise<void> {
    const repo = manager ? manager.getRepository(Producto) : this.repo;
    await repo.update(id, {
      costo: costo,
      precio_venta: parseFloat((costo * 1.35).toFixed(2)),
    });
  }
}
