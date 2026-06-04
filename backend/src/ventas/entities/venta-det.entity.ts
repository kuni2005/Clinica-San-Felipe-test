import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { VentaCab } from './venta-cab.entity';

@Entity('venta_det')
export class VentaDet {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id_venta_det: number;

  @Column()
  @ApiProperty()
  id_venta_cab: number;

  @ManyToOne(() => VentaCab, (cab) => cab.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_venta_cab' })
  ventaCab: VentaCab;

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
