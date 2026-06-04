import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { MovimientoDet } from './movimiento-det.entity';

@Entity('movimiento_cab')
export class MovimientoCab {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id_movimiento_cab: number;

  @CreateDateColumn()
  @ApiProperty()
  fec_registro: Date;

  @Column({ type: 'smallint', comment: '1=Entrada, 2=Salida' })
  @ApiProperty({ enum: [1, 2], description: '1=Entrada, 2=Salida' })
  id_tipo_movimiento: number;

  @Column({ nullable: true })
  @ApiProperty({ description: 'ID del documento origen (compra o venta)' })
  id_documento_origen: number;

  @OneToMany(() => MovimientoDet, (det) => det.movimientoCab, {
    cascade: true,
    eager: false,
  })
  detalles: MovimientoDet[];
}
