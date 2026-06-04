import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CompraDet } from './compra-det.entity';

@Entity('compra_cab')
export class CompraCab {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id_compra_cab: number;

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

  @OneToMany(() => CompraDet, (det) => det.compraCab, {
    cascade: true,
    eager: false,
  })
  detalles: CompraDet[];
}
