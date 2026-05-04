DROP TABLE IF EXISTS detalle_venta;
DROP TABLE IF EXISTS venta;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS proveedor;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS empleado;
DROP TABLE IF EXISTS usuario;

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL
);

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL
);

CREATE TABLE empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    puesto VARCHAR(50) NOT NULL
);

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    id_categoria INT NOT NULL REFERENCES categoria(id_categoria),
    id_proveedor INT NOT NULL REFERENCES proveedor(id_proveedor)
);

CREATE TABLE venta (
    id_venta SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    id_cliente INT NOT NULL REFERENCES cliente(id_cliente),
    id_empleado INT NOT NULL REFERENCES empleado(id_empleado)
);

CREATE TABLE detalle_venta (
    id_detalle SERIAL PRIMARY KEY,
    id_venta INT NOT NULL REFERENCES venta(id_venta),
    id_producto INT NOT NULL REFERENCES producto(id_producto),
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

CREATE VIEW vista_reporte_ventas AS
SELECT 
    v.id_venta,
    v.fecha,
    c.nombre AS cliente,
    e.nombre AS empleado,
    v.total
FROM venta v
JOIN cliente c ON v.id_cliente = c.id_cliente
JOIN empleado e ON v.id_empleado = e.id_empleado;