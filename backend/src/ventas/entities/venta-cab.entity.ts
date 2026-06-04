import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { VentaDet } from './venta-det.entity';

@Entity('venta_cab')
export class VentaCab {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id_venta_cab: number;

  @CreateDateColumn()
  @ApiProperty()
  fec_registro: Date;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  @ApiProperty()
  sub_total: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  @ApiProperty()
  igv: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  @ApiProperty()
  total: number;

  @OneToMany(() => VentaDet, (det) => det.ventaCab, {
    cascade: true,
    eager: false,
  })
  detalles: VentaDet[];
}
