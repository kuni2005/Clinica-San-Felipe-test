import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MovimientosService } from './movimientos.service';

@ApiTags('movimientos')
@ApiBearerAuth('JWT-auth')
@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly service: MovimientosService) {}

  @Get('kardex')
  @ApiOperation({
    summary: 'Kardex: lista productos con stock_actual, costo y precio_venta',
  })
  getKardex() {
    return this.service.getKardex();
  }

  @Get('producto/:id')
  @ApiOperation({ summary: 'Movimientos de un producto (para modal de kardex)' })
  getByProducto(@Param('id', ParseIntPipe) id: number) {
    return this.service.getMovimientosByProducto(id);
  }
}
