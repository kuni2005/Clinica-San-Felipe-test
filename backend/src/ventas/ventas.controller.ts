import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VentasFacade } from './ventas.facade';
import { CreateVentaDto } from './dto/create-venta.dto';

@ApiTags('ventas')
@ApiBearerAuth('JWT-auth')
@Controller('ventas')
export class VentasController {
  constructor(private readonly facade: VentasFacade) {}

  @Post()
  @ApiOperation({
    summary:
      'Registrar venta: valida stock, crea VentaCab+Det y genera movimiento Salida',
  })
  registrar(@Body() dto: CreateVentaDto) {
    return this.facade.registrarVenta(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas con sus detalles' })
  listar() {
    return this.facade.listarVentas();
  }
}
