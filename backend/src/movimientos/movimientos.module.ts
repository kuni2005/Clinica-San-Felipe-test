import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoCab } from './entities/movimiento-cab.entity';
import { MovimientoDet } from './entities/movimiento-det.entity';
import { Producto } from '../productos/entities/producto.entity';
import { MovimientosService } from './movimientos.service';
import { MovimientosController } from './movimientos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientoCab, MovimientoDet, Producto])],
  controllers: [MovimientosController],
  providers: [MovimientosService],
  exports: [MovimientosService],
})
export class MovimientosModule {}
