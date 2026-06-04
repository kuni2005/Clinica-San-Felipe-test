import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateCompraDetalleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id_producto: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.01)
  cantidad: number;

  @ApiProperty({ example: 5.0, description: 'Precio de compra (costo)' })
  @IsNumber()
  @Min(0.01)
  precio: number;
}

export class CreateCompraDto {
  @ApiProperty({ type: [CreateCompraDetalleDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateCompraDetalleDto)
  @ArrayMinSize(1)
  detalles: CreateCompraDetalleDto[];
}
