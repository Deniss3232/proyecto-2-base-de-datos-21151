DROP TABLE IF EXISTS detalle_venta;
DROP TABLE IF EXISTS venta;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS proveedor;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS cliente;

CREATE TABLE categoria (
 id_categoria SERIAL PRIMARY KEY,
 nombre VARCHAR(100) NOT NULL
);

CREATE TABLE proveedor (
 id_proveedor SERIAL PRIMARY KEY,
 nombre VARCHAR(100) NOT NULL,
 telefono VARCHAR(20)
);

CREATE TABLE cliente (
 id_cliente SERIAL PRIMARY KEY,
 nombre VARCHAR(100) NOT NULL,
 telefono VARCHAR(20)
);

CREATE TABLE producto (
 id_producto SERIAL PRIMARY KEY,
 nombre VARCHAR(100) NOT NULL,
 precio DECIMAL(10,2) NOT NULL,
 stock INT NOT NULL,
 id_categoria INT REFERENCES categoria(id_categoria),
 id_proveedor INT REFERENCES proveedor(id_proveedor)
);

CREATE TABLE venta (
 id_venta SERIAL PRIMARY KEY,
 fecha DATE NOT NULL,
 total DECIMAL(10,2),
 id_cliente INT REFERENCES cliente(id_cliente)
);

CREATE TABLE detalle_venta (
 id_detalle SERIAL PRIMARY KEY,
 id_venta INT REFERENCES venta(id_venta),
 id_producto INT REFERENCES producto(id_producto),
 cantidad INT,
 subtotal DECIMAL(10,2)
);
