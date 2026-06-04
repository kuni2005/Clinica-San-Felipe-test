import { Injectable } from '@nestjs/common';
import { LogOperation } from '../common/decorators/log-operation.decorator';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';

/**
 * Facade pattern: simplified interface over ProductosService.
 * Controllers depend on this facade, not on the service directly.
 */
@Injectable()
export class ProductosFacade {
  constructor(private readonly productosService: ProductosService) {}

  @LogOperation('listar-productos')
  listar(): Promise<Producto[]> {
    return this.productosService.findAll();
  }

  @LogOperation('obtener-producto')
  obtener(id: number): Promise<Producto> {
    return this.productosService.findOne(id);
  }

  @LogOperation('crear-producto')
  crear(dto: CreateProductoDto): Promise<Producto> {
    return this.productosService.create(dto);
  }

  @LogOperation('actualizar-producto')
  actualizar(id: number, dto: UpdateProductoDto): Promise<Producto> {
    return this.productosService.update(id, dto);
  }
}
