import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompraCab } from './entities/compra-cab.entity';
import { CompraDet } from './entities/compra-det.entity';
import { ComprasService } from './compras.service';
import { ComprasFacade } from './compras.facade';
import { ComprasController } from './compras.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompraCab, CompraDet])],
  controllers: [ComprasController],
  providers: [ComprasService, ComprasFacade],
})
export class ComprasModule {}
