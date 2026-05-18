INSERT INTO categoria(nombre)
SELECT 'Categoria ' || numero
FROM generate_series(1, 25) AS numero;

INSERT INTO proveedor(nombre, telefono)
SELECT 
    'Proveedor ' || numero,
    '5555-' || LPAD(numero::TEXT, 4, '0')
FROM generate_series(1, 25) AS numero;

INSERT INTO cliente(nombre, telefono)
SELECT 
    'Cliente ' || numero,
    '4000-' || LPAD(numero::TEXT, 4, '0')
FROM generate_series(1, 25) AS numero;

INSERT INTO empleado(nombre, puesto)
SELECT 
    'Empleado ' || numero,
    CASE 
        WHEN numero % 3 = 0 THEN 'Administrador'
        WHEN numero % 3 = 1 THEN 'Cajero'
        ELSE 'Vendedor'
    END
FROM generate_series(1, 25) AS numero;

INSERT INTO usuario(correo, password, nombre, rol) VALUES
('admin@refrescos.com', '1234', 'Administrador Principal', 'admin'),
('gerente@refrescos.com', '1234', 'Gerente General', 'gerente'),
('cajero@refrescos.com', '1234', 'Cajero Principal', 'cajero'),
('inventario@refrescos.com', '1234', 'Encargado de Inventario', 'inventario'),
('reportes@refrescos.com', '1234', 'Encargado de Reportes', 'reportes');

INSERT INTO producto(nombre, precio, stock, id_categoria, id_proveedor)
SELECT 
    CASE 
        WHEN numero = 1 THEN 'Coca Cola 600ml'
        WHEN numero = 2 THEN 'Pepsi 600ml'
        WHEN numero = 3 THEN 'Sprite 600ml'
        WHEN numero = 4 THEN 'Fanta Naranja 600ml'
        WHEN numero = 5 THEN 'Jugo de Naranja 500ml'
        WHEN numero = 6 THEN 'Jugo de Manzana 500ml'
        WHEN numero = 7 THEN 'Agua Pura 600ml'
        WHEN numero = 8 THEN 'Agua Mineral 600ml'
        WHEN numero = 9 THEN 'Té Frío Limón 500ml'
        WHEN numero = 10 THEN 'Té Frío Durazno 500ml'
        WHEN numero = 11 THEN 'Red Bull 250ml'
        WHEN numero = 12 THEN 'Monster Energy 473ml'
        WHEN numero = 13 THEN 'Gatorade Azul 600ml'
        WHEN numero = 14 THEN 'Gatorade Rojo 600ml'
        WHEN numero = 15 THEN 'Limonada Natural 500ml'
        WHEN numero = 16 THEN 'Naranjada Natural 500ml'
        WHEN numero = 17 THEN 'Coca Cola 1.5L'
        WHEN numero = 18 THEN 'Pepsi 1.5L'
        WHEN numero = 19 THEN 'Sprite 1.5L'
        WHEN numero = 20 THEN 'Fanta 1.5L'
        WHEN numero = 21 THEN 'Jugo de Uva 500ml'
        WHEN numero = 22 THEN 'Jugo de Piña 500ml'
        WHEN numero = 23 THEN 'Agua Pura 1L'
        WHEN numero = 24 THEN 'Té Verde 500ml'
        ELSE 'Refresco Especial 500ml'
    END,
    (5 + numero)::DECIMAL(10,2),
    20 + numero,
    ((numero - 1) % 25) + 1,
    ((numero - 1) % 25) + 1
FROM generate_series(1, 25) AS numero;

INSERT INTO venta(fecha, total, id_cliente, id_empleado)
SELECT 
    CURRENT_DATE - numero,
    (20 + numero)::DECIMAL(10,2),
    ((numero - 1) % 25) + 1,
    ((numero - 1) % 25) + 1
FROM generate_series(1, 25) AS numero;

INSERT INTO detalle_venta(id_venta, id_producto, cantidad, subtotal)
SELECT
    numero,
    ((numero - 1) % 25) + 1,
    2,
    ((5 + numero) * 2)::DECIMAL(10,2)
FROM generate_series(1, 25) AS numero;