import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id_producto: number;

  @Column({ length: 200 })
  @ApiProperty()
  nombre_producto: string;

  @Column({ length: 100 })
  @ApiProperty()
  nro_lote: string;

  @CreateDateColumn()
  @ApiProperty()
  fec_registro: Date;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @ApiProperty()
  costo: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  @ApiProperty()
  precio_venta: number;
}
