INSERT INTO categoria(nombre)
SELECT 'Categoria ' || numero
FROM generate_series(1, 25) AS numero;

INSERT INTO proveedor(nombre, telefono)
SELECT 'Proveedor ' || numero, '5555-' || LPAD(numero::TEXT, 4, '0')
FROM generate_series(1, 25) AS numero;

INSERT INTO cliente(nombre, telefono)
SELECT 'Cliente ' || numero, '4000-' || LPAD(numero::TEXT, 4, '0')
FROM generate_series(1, 25) AS numero;

INSERT INTO empleado(nombre, puesto)
SELECT 'Empleado ' || numero,
CASE 
    WHEN numero % 3 = 0 THEN 'Administrador'
    WHEN numero % 3 = 1 THEN 'Cajero'
    ELSE 'Vendedor'
END
FROM generate_series(1, 25) AS numero;

INSERT INTO usuario(correo, password, nombre) VALUES
('admin@refrescos.com', '1234', 'Administrador Principal');

INSERT INTO producto(nombre, precio, stock, id_categoria, id_proveedor)
SELECT 
    'Refresco ' || numero,
    5 + numero,
    20 + numero,
    ((numero - 1) % 25) + 1,
    ((numero - 1) % 25) + 1
FROM generate_series(1, 25) AS numero;

INSERT INTO venta(fecha, total, id_cliente, id_empleado)
SELECT 
    CURRENT_DATE - numero,
    20 + numero,
    ((numero - 1) % 25) + 1,
    ((numero - 1) % 25) + 1
FROM generate_series(1, 25) AS numero;

INSERT INTO detalle_venta(id_venta, id_producto, cantidad, subtotal)
SELECT
    numero,
    ((numero - 1) % 25) + 1,
    2,
    (5 + numero) * 2
FROM generate_series(1, 25) AS numero;