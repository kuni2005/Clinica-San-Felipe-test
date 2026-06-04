export interface Producto {
  id_producto: number;
  nombre_producto: string;
  nro_lote: string;
  fec_registro: string;
  costo: number;
  precio_venta: number;
}

export interface KardexItem {
  id_producto: number;
  nombre_producto: string;
  stock_actual: number;
  costo: number;
  precio_venta: number;
}

export interface CompraDetalleInput {
  id_producto: number;
  nombre_producto?: string;
  cantidad: number;
  precio: number;
}

export interface VentaDetalleInput {
  id_producto: number;
  nombre_producto?: string;
  cantidad: number;
  stock_disponible?: number;
}

export interface MovimientoDet {
  id_movimiento_det: number;
  id_movimiento_cab: number;
  id_producto: number;
  cantidad: number;
}

export interface MovimientoCab {
  id_movimiento_cab: number;
  fec_registro: string;
  id_tipo_movimiento: number;
  tipo_nombre: string;
  id_documento_origen: number;
  detalles: MovimientoDet[];
}

export interface CreateProductoPayload {
  nombre_producto: string;
  nro_lote: string;
  costo: number;
  precio_venta: number;
}
