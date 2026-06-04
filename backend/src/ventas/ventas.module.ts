import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaCab } from './entities/venta-cab.entity';
import { VentaDet } from './entities/venta-det.entity';
import { VentasService } from './ventas.service';
import { VentasFacade } from './ventas.facade';
import { VentasController } from './ventas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VentaCab, VentaDet])],
  controllers: [VentasController],
  providers: [VentasService, VentasFacade],
})
export class VentasModule {}
