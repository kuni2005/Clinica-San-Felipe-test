import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateVentaDetalleDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  id_producto: number;

  @ApiProperty({ example: 5, description: 'Cantidad a vender (debe ser <= stock disponible)' })
  @IsNumber()
  @Min(0.01)
  cantidad: number;
}

export class CreateVentaDto {
  @ApiProperty({ type: [CreateVentaDetalleDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateVentaDetalleDto)
  @ArrayMinSize(1)
  detalles: CreateVentaDetalleDto[];
}
