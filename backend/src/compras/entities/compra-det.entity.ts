import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CompraCab } from './compra-cab.entity';

@Entity('compra_det')
export class CompraDet {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id_compra_det: number;

  @Column()
  @ApiProperty()
  id_compra_cab: number;

  @ManyToOne(() => CompraCab, (cab) => cab.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_compra_cab' })
  compraCab: CompraCab;

  @Column()
  @ApiProperty()
  id_producto: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty()
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty()
  precio: number;

  @Column('decimal', { precision: 12, scale: 2 })
  @ApiProperty()
  sub_total: number;

  @Column('decimal', { precision: 12, scale: 2 })
  @ApiProperty()
  igv: number;

  @Column('decimal', { precision: 12, scale: 2 })
  @ApiProperty()
  total: number;
}
