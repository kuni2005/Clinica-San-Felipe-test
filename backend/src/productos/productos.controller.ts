import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProductosFacade } from './productos.facade';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@ApiTags('productos')
@ApiBearerAuth('JWT-auth')
@Controller('productos')
export class ProductosController {
  constructor(private readonly facade: ProductosFacade) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los productos' })
  findAll() {
    return this.facade.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facade.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar nuevo producto' })
  create(@Body() dto: CreateProductoDto) {
    return this.facade.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductoDto,
  ) {
    return this.facade.actualizar(id, dto);
  }
}
