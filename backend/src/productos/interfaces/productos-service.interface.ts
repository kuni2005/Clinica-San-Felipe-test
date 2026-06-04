import { EntityManager } from 'typeorm';
import { Producto } from '../entities/producto.entity';
import { CreateProductoDto } from '../dto/create-producto.dto';
import { UpdateProductoDto } from '../dto/update-producto.dto';

// SOLID-I: Interface segregation — separate read & write concerns
export interface IProductosReader {
  findAll(): Promise<Producto[]>;
  findOne(id: number): Promise<Producto>;
}

export interface IProductosWriter {
  create(dto: CreateProductoDto): Promise<Producto>;
  update(id: number, dto: UpdateProductoDto): Promise<Producto>;
  actualizarCostoYPrecio(
    id: number,
    costo: number,
    manager?: EntityManager,
  ): Promise<void>;
}

export type IProductosService = IProductosReader & IProductosWriter;
