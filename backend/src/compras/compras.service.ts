import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompraCab } from './entities/compra-cab.entity';
import { CompraDet } from './entities/compra-det.entity';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(CompraCab)
    private readonly cabRepo: Repository<CompraCab>,
    @InjectRepository(CompraDet)
    private readonly detRepo: Repository<CompraDet>,
  ) {}

  async findAll(): Promise<CompraCab[]> {
    return this.cabRepo.find({
      relations: ['detalles'],
      order: { id_compra_cab: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CompraCab> {
    return this.cabRepo.findOne({
      where: { id_compra_cab: id },
      relations: ['detalles'],
    });
  }
}
