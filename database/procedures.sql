CREATE OR REPLACE PROCEDURE sp_crear_producto(
    p_nombre VARCHAR,
    p_precio DECIMAL,
    p_stock INT,
    p_categoria INT,
    p_proveedor INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO producto(nombre, precio, stock, id_categoria, id_proveedor)
    VALUES (p_nombre, p_precio, p_stock, p_categoria, p_proveedor);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_actualizar_stock(
    p_id_producto INT,
    p_stock INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE producto
    SET stock = p_stock
    WHERE id_producto = p_id_producto;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_crear_cliente(
    p_nombre VARCHAR,
    p_telefono VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO cliente(nombre, telefono)
    VALUES (p_nombre, p_telefono);
END;
$$;

CREATE OR REPLACE PROCEDURE sp_actualizar_cliente(
    p_id_cliente INT,
    p_nombre VARCHAR,
    p_telefono VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE cliente
    SET nombre = p_nombre,
        telefono = p_telefono
    WHERE id_cliente = p_id_cliente;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_registrar_venta(
    p_id_producto INT,
    p_cantidad INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    stock_actual INT;
BEGIN
    SELECT stock INTO stock_actual
    FROM producto
    WHERE id_producto = p_id_producto;

    IF stock_actual < p_cantidad THEN
        RAISE EXCEPTION 'Stock insuficiente';
    END IF;

    UPDATE producto
    SET stock = stock - p_cantidad
    WHERE id_producto = p_id_producto;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error en la venta';
        ROLLBACK;
END;
$$;