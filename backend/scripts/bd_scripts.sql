-- ============================================================
-- SCRIPTS DE BASE DE DATOS - Sistema de Compras y Ventas
-- Motor: PostgreSQL 15
-- ============================================================

-- ------------------------------------------------------------
-- CREACIÓN DE TABLAS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS productos (
    id_producto     SERIAL PRIMARY KEY,
    nombre_producto VARCHAR(200) NOT NULL,
    nro_lote        VARCHAR(100) NOT NULL,
    fec_registro    TIMESTAMP DEFAULT NOW(),
    costo           NUMERIC(10,2) DEFAULT 0,
    precio_venta    NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS compra_cab (
    id_compra_cab SERIAL PRIMARY KEY,
    fec_registro  TIMESTAMP DEFAULT NOW(),
    sub_total     NUMERIC(12,2) DEFAULT 0,
    igv           NUMERIC(12,2) DEFAULT 0,
    total         NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS compra_det (
    id_compra_det SERIAL PRIMARY KEY,
    id_compra_cab INT NOT NULL REFERENCES compra_cab(id_compra_cab) ON DELETE CASCADE,
    id_producto   INT NOT NULL REFERENCES productos(id_producto),
    cantidad      NUMERIC(10,2) NOT NULL,
    precio        NUMERIC(10,2) NOT NULL,
    sub_total     NUMERIC(12,2) NOT NULL,
    igv           NUMERIC(12,2) NOT NULL,
    total         NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS venta_cab (
    id_venta_cab SERIAL PRIMARY KEY,
    fec_registro TIMESTAMP DEFAULT NOW(),
    sub_total    NUMERIC(12,2) DEFAULT 0,
    igv          NUMERIC(12,2) DEFAULT 0,
    total        NUMERIC(12,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS venta_det (
    id_venta_det SERIAL PRIMARY KEY,
    id_venta_cab INT NOT NULL REFERENCES venta_cab(id_venta_cab) ON DELETE CASCADE,
    id_producto  INT NOT NULL REFERENCES productos(id_producto),
    cantidad     NUMERIC(10,2) NOT NULL,
    precio       NUMERIC(10,2) NOT NULL,
    sub_total    NUMERIC(12,2) NOT NULL,
    igv          NUMERIC(12,2) NOT NULL,
    total        NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS movimiento_cab (
    id_movimiento_cab  SERIAL PRIMARY KEY,
    fec_registro       TIMESTAMP DEFAULT NOW(),
    id_tipo_movimiento SMALLINT NOT NULL CHECK (id_tipo_movimiento IN (1, 2)),
    -- 1 = Entrada (Compra), 2 = Salida (Venta)
    id_documento_origen INT
);

CREATE TABLE IF NOT EXISTS movimiento_det (
    id_movimiento_det SERIAL PRIMARY KEY,
    id_movimiento_cab INT NOT NULL REFERENCES movimiento_cab(id_movimiento_cab) ON DELETE CASCADE,
    id_producto       INT NOT NULL REFERENCES productos(id_producto),
    cantidad          NUMERIC(10,2) NOT NULL
);

-- ------------------------------------------------------------
-- PRODUCTOS
-- ------------------------------------------------------------

-- INSERTAR producto
INSERT INTO productos (nombre_producto, nro_lote, costo, precio_venta)
VALUES ('Paracetamol 500mg', 'LOTE-2024-001', 5.00, 6.75);

INSERT INTO productos (nombre_producto, nro_lote, costo, precio_venta)
VALUES ('Amoxicilina 500mg', 'LOTE-2024-002', 8.00, 10.80);

INSERT INTO productos (nombre_producto, nro_lote, costo, precio_venta)
VALUES ('Ibuprofeno 400mg', 'LOTE-2024-003', 4.50, 6.08);

-- LISTAR todos los productos
SELECT
    id_producto,
    nombre_producto,
    nro_lote,
    fec_registro,
    costo,
    precio_venta
FROM productos
ORDER BY id_producto ASC;

-- LISTAR un producto por ID
SELECT
    id_producto,
    nombre_producto,
    nro_lote,
    fec_registro,
    costo,
    precio_venta
FROM productos
WHERE id_producto = 1;

-- ACTUALIZAR producto (nombre y precios)
UPDATE productos
SET nombre_producto = 'Paracetamol 1g',
    nro_lote        = 'LOTE-2024-010',
    costo           = 6.00,
    precio_venta    = 8.10
WHERE id_producto = 1;

-- ELIMINAR producto
DELETE FROM productos
WHERE id_producto = 1;

-- ------------------------------------------------------------
-- COMPRAS (CompraCab + CompraDet)
-- ------------------------------------------------------------

-- INSERTAR compra cabecera
INSERT INTO compra_cab (sub_total, igv, total)
VALUES (100.00, 18.00, 118.00);

-- INSERTAR detalle de compra
INSERT INTO compra_det (id_compra_cab, id_producto, cantidad, precio, sub_total, igv, total)
VALUES (1, 2, 10, 10.00, 100.00, 18.00, 118.00);

-- LISTAR todas las compras con sus detalles
SELECT
    cc.id_compra_cab,
    cc.fec_registro,
    cc.sub_total,
    cc.igv,
    cc.total,
    cd.id_compra_det,
    p.nombre_producto,
    cd.cantidad,
    cd.precio,
    cd.sub_total  AS det_sub_total,
    cd.igv        AS det_igv,
    cd.total      AS det_total
FROM compra_cab cc
INNER JOIN compra_det cd ON cd.id_compra_cab = cc.id_compra_cab
INNER JOIN productos   p  ON p.id_producto   = cd.id_producto
ORDER BY cc.id_compra_cab DESC;

-- LISTAR una compra por ID
SELECT
    cc.id_compra_cab,
    cc.fec_registro,
    cc.sub_total,
    cc.igv,
    cc.total
FROM compra_cab cc
WHERE cc.id_compra_cab = 1;

-- ELIMINAR compra (en cascada elimina sus detalles)
DELETE FROM compra_cab WHERE id_compra_cab = 1;

-- ------------------------------------------------------------
-- VENTAS (VentaCab + VentaDet)
-- ------------------------------------------------------------

-- INSERTAR venta cabecera
INSERT INTO venta_cab (sub_total, igv, total)
VALUES (67.50, 12.15, 79.65);

-- INSERTAR detalle de venta
INSERT INTO venta_det (id_venta_cab, id_producto, cantidad, precio, sub_total, igv, total)
VALUES (1, 2, 5, 13.50, 67.50, 12.15, 79.65);

-- LISTAR todas las ventas con sus detalles
SELECT
    vc.id_venta_cab,
    vc.fec_registro,
    vc.sub_total,
    vc.igv,
    vc.total,
    vd.id_venta_det,
    p.nombre_producto,
    vd.cantidad,
    vd.precio,
    vd.sub_total AS det_sub_total,
    vd.igv       AS det_igv,
    vd.total     AS det_total
FROM venta_cab vc
INNER JOIN venta_det vd ON vd.id_venta_cab = vc.id_venta_cab
INNER JOIN productos  p  ON p.id_producto  = vd.id_producto
ORDER BY vc.id_venta_cab DESC;

-- LISTAR una venta por ID
SELECT
    id_venta_cab,
    fec_registro,
    sub_total,
    igv,
    total
FROM venta_cab
WHERE id_venta_cab = 1;

-- ELIMINAR venta (en cascada elimina sus detalles)
DELETE FROM venta_cab WHERE id_venta_cab = 1;

-- ------------------------------------------------------------
-- MOVIMIENTOS (Kardex)
-- ------------------------------------------------------------

-- INSERTAR movimiento cabecera tipo Entrada (1 = compra)
INSERT INTO movimiento_cab (id_tipo_movimiento, id_documento_origen)
VALUES (1, 1);

-- INSERTAR movimiento cabecera tipo Salida (2 = venta)
INSERT INTO movimiento_cab (id_tipo_movimiento, id_documento_origen)
VALUES (2, 1);

-- INSERTAR detalle de movimiento
INSERT INTO movimiento_det (id_movimiento_cab, id_producto, cantidad)
VALUES (1, 2, 10);

-- LISTAR Kardex: stock actual por producto (entradas - salidas)
SELECT
    p.id_producto,
    p.nombre_producto,
    p.nro_lote,
    p.costo,
    p.precio_venta,
    COALESCE(SUM(CASE WHEN mc.id_tipo_movimiento = 1 THEN md.cantidad ELSE 0 END), 0) AS total_entradas,
    COALESCE(SUM(CASE WHEN mc.id_tipo_movimiento = 2 THEN md.cantidad ELSE 0 END), 0) AS total_salidas,
    COALESCE(SUM(CASE WHEN mc.id_tipo_movimiento = 1 THEN md.cantidad ELSE 0 END), 0)
    - COALESCE(SUM(CASE WHEN mc.id_tipo_movimiento = 2 THEN md.cantidad ELSE 0 END), 0) AS stock_actual
FROM productos p
LEFT JOIN movimiento_det md ON md.id_producto   = p.id_producto
LEFT JOIN movimiento_cab mc ON mc.id_movimiento_cab = md.id_movimiento_cab
GROUP BY p.id_producto, p.nombre_producto, p.nro_lote, p.costo, p.precio_venta
ORDER BY p.id_producto ASC;

-- LISTAR movimientos de un producto específico
SELECT
    mc.id_movimiento_cab,
    mc.fec_registro,
    CASE mc.id_tipo_movimiento WHEN 1 THEN 'Entrada' WHEN 2 THEN 'Salida' END AS tipo_movimiento,
    mc.id_documento_origen,
    md.cantidad,
    p.nombre_producto
FROM movimiento_cab mc
INNER JOIN movimiento_det md ON md.id_movimiento_cab = mc.id_movimiento_cab
INNER JOIN productos       p  ON p.id_producto       = md.id_producto
WHERE md.id_producto = 2
ORDER BY mc.fec_registro DESC;

-- ELIMINAR movimiento (en cascada elimina sus detalles)
DELETE FROM movimiento_cab WHERE id_movimiento_cab = 1;
