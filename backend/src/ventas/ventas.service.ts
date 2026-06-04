import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VentaCab } from './entities/venta-cab.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(VentaCab)
    private readonly cabRepo: Repository<VentaCab>,
  ) {}

  async findAll(): Promise<VentaCab[]> {
    return this.cabRepo.find({
      relations: ['detalles'],
      order: { id_venta_cab: 'DESC' },
    });
  }

  async findOne(id: number): Promise<VentaCab> {
    return this.cabRepo.findOne({
      where: { id_venta_cab: id },
      relations: ['detalles'],
    });
  }
}
