import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateProductoDto {
  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  @MinLength(2)
  nombre_producto: string;

  @ApiProperty({ example: 'LOTE-2024-001' })
  @IsString()
  @MinLength(1)
  nro_lote: string;

  @ApiProperty({ example: 5.0 })
  @IsNumber()
  @Min(0)
  costo: number;

  @ApiProperty({ example: 6.75 })
  @IsNumber()
  @Min(0)
  precio_venta: number;
}
