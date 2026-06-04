import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComprasFacade } from './compras.facade';
import { CreateCompraDto } from './dto/create-compra.dto';

@ApiTags('compras')
@ApiBearerAuth('JWT-auth')
@Controller('compras')
export class ComprasController {
  constructor(private readonly facade: ComprasFacade) {}

  @Post()
  @ApiOperation({
    summary:
      'Registrar compra: crea CompraCab+Det, actualiza precio_venta y genera movimiento Entrada',
  })
  registrar(@Body() dto: CreateCompraDto) {
    return this.facade.registrarCompra(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar compras con sus detalles' })
  listar() {
    return this.facade.listarCompras();
  }
}
