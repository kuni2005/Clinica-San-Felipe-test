import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MovimientoCab } from './movimiento-cab.entity';

@Entity('movimiento_det')
export class MovimientoDet {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id_movimiento_det: number;

  @Column()
  @ApiProperty()
  id_movimiento_cab: number;

  @ManyToOne(() => MovimientoCab, (cab) => cab.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_movimiento_cab' })
  movimientoCab: MovimientoCab;

  @Column()
  @ApiProperty()
  id_producto: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @ApiProperty()
  cantidad: number;
}
