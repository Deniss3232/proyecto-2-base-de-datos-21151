const express = require("express");
const cors = require("cors");
const session = require("express-session");
const pool = require("./db");

const app = express();

app.use(cors({
  origin: ["http://localhost:5500", "http://localhost:8080"],
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "secreto_tienda_refrescos",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60
  }
}));

app.get("/", (req, res) => {
  res.send("API Tienda de Refrescos funcionando");
});

// LOGIN / SESIÓN

app.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    const result = await pool.query(
      `SELECT id_usuario, correo, nombre
       FROM usuario
       WHERE correo = $1 AND password = $2`,
      [correo, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    req.session.usuario = result.rows[0];

    res.json({
      mensaje: "Login correcto",
      usuario: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en login" });
  }
});

app.get("/sesion", (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({ mensaje: "No hay sesión activa" });
  }

  res.json({
    mensaje: "Sesión activa",
    usuario: req.session.usuario
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ mensaje: "Sesión cerrada correctamente" });
  });
});

// CATÁLOGOS

app.get("/categorias", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM categoria
      ORDER BY id_categoria;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener categorías" });
  }
});

app.get("/proveedores", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM proveedor
      ORDER BY id_proveedor;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener proveedores" });
  }
});

app.get("/empleados", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM empleado
      ORDER BY id_empleado;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener empleados" });
  }
});

// PRODUCTOS - CRUD

app.get("/productos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id_producto,
        p.nombre,
        p.precio,
        p.stock,
        c.nombre AS categoria,
        pr.nombre AS proveedor
      FROM producto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
      JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
      ORDER BY p.id_producto;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener productos" });
  }
});

app.post("/productos", async (req, res) => {
  try {
    const { nombre, precio, stock, id_categoria, id_proveedor } = req.body;

    if (!nombre || precio <= 0 || stock < 0 || !id_categoria || !id_proveedor) {
      return res.status(400).json({ mensaje: "Datos inválidos para producto" });
    }

    const result = await pool.query(
      `INSERT INTO producto(nombre, precio, stock, id_categoria, id_proveedor)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [nombre, precio, stock, id_categoria, id_proveedor]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear producto" });
  }
});

app.put("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;

    if (!nombre || precio <= 0 || stock < 0) {
      return res.status(400).json({ mensaje: "Datos inválidos para actualizar producto" });
    }

    const result = await pool.query(
      `UPDATE producto
       SET nombre = $1, precio = $2, stock = $3
       WHERE id_producto = $4
       RETURNING *;`,
      [nombre, precio, stock, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar producto" });
  }
});

app.delete("/productos/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM producto
       WHERE id_producto = $1
       RETURNING *;`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      mensaje: "No se pudo eliminar el producto porque puede estar relacionado con ventas"
    });
  }
});

// CLIENTES - CRUD

app.get("/clientes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM cliente
      ORDER BY id_cliente;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener clientes" });
  }
});

app.post("/clientes", async (req, res) => {
  try {
    const { nombre, telefono } = req.body;

    if (!nombre || !telefono) {
      return res.status(400).json({ mensaje: "Datos inválidos para cliente" });
    }

    const result = await pool.query(
      `INSERT INTO cliente(nombre, telefono)
       VALUES ($1, $2)
       RETURNING *;`,
      [nombre, telefono]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear cliente" });
  }
});

app.put("/clientes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono } = req.body;

    if (!nombre || !telefono) {
      return res.status(400).json({ mensaje: "Datos inválidos para actualizar cliente" });
    }

    const result = await pool.query(
      `UPDATE cliente
       SET nombre = $1, telefono = $2
       WHERE id_cliente = $3
       RETURNING *;`,
      [nombre, telefono, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar cliente" });
  }
});

app.delete("/clientes/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM cliente
       WHERE id_cliente = $1
       RETURNING *;`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.json({ mensaje: "Cliente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      mensaje: "No se pudo eliminar el cliente porque puede tener ventas relacionadas"
    });
  }
});

// REPORTES Y CONSULTAS SQL

app.get("/reporte-ventas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM vista_reporte_ventas
      ORDER BY id_venta;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al generar reporte" });
  }
});

app.get("/consulta-join", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.id_detalle,
        v.fecha,
        cl.nombre AS cliente,
        p.nombre AS producto,
        c.nombre AS categoria,
        d.cantidad,
        d.subtotal
      FROM detalle_venta d
      JOIN venta v ON d.id_venta = v.id_venta
      JOIN cliente cl ON v.id_cliente = cl.id_cliente
      JOIN producto p ON d.id_producto = p.id_producto
      JOIN categoria c ON p.id_categoria = c.id_categoria
      ORDER BY d.id_detalle;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en consulta JOIN" });
  }
});

app.get("/consulta-join-ventas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.id_venta,
        v.fecha,
        c.nombre AS cliente,
        e.nombre AS empleado,
        v.total
      FROM venta v
      JOIN cliente c ON v.id_cliente = c.id_cliente
      JOIN empleado e ON v.id_empleado = e.id_empleado
      ORDER BY v.id_venta;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en consulta JOIN de ventas" });
  }
});

app.get("/consulta-join-productos", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id_producto,
        p.nombre AS producto,
        p.precio,
        p.stock,
        c.nombre AS categoria,
        pr.nombre AS proveedor
      FROM producto p
      JOIN categoria c ON p.id_categoria = c.id_categoria
      JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
      ORDER BY p.id_producto;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en consulta JOIN de productos" });
  }
});

app.get("/consulta-subquery", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT nombre, precio
      FROM producto
      WHERE precio > (
        SELECT AVG(precio)
        FROM producto
      )
      ORDER BY precio DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en consulta con subquery" });
  }
});

app.get("/consulta-subquery-stock", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT nombre, stock
      FROM producto
      WHERE id_producto IN (
        SELECT id_producto
        FROM detalle_venta
      )
      ORDER BY stock ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en segunda subquery" });
  }
});

app.get("/consulta-group", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.nombre AS categoria,
        COUNT(p.id_producto) AS cantidad_productos,
        SUM(p.stock) AS stock_total
      FROM categoria c
      JOIN producto p ON c.id_categoria = p.id_categoria
      GROUP BY c.nombre
      HAVING SUM(p.stock) > 20
      ORDER BY stock_total DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en consulta GROUP BY" });
  }
});

app.get("/consulta-cte", async (req, res) => {
  try {
    const result = await pool.query(`
      WITH productos_bajo_stock AS (
        SELECT nombre, stock
        FROM producto
        WHERE stock < 35
      )
      SELECT *
      FROM productos_bajo_stock
      ORDER BY stock ASC;
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en consulta CTE" });
  }
});

app.get("/exportar-reporte", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM vista_reporte_ventas
      ORDER BY id_venta;
    `);

    let csv = "id_venta,fecha,cliente,empleado,total\n";

    result.rows.forEach((row) => {
      csv += `${row.id_venta},${row.fecha},${row.cliente},${row.empleado},${row.total}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("reporte_ventas.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al exportar reporte" });
  }
});

// VENTAS CON TRANSACCIÓN

app.post("/ventas", async (req, res) => {
  const client = await pool.connect();

  try {
    const { id_cliente, id_empleado, productos } = req.body;

    if (!id_cliente || !id_empleado || !productos || productos.length === 0) {
      return res.status(400).json({ mensaje: "Datos inválidos para venta" });
    }

    await client.query("BEGIN");

    let total = 0;

    for (const item of productos) {
      const producto = await client.query(
        `SELECT precio, stock
         FROM producto
         WHERE id_producto = $1;`,
        [item.id_producto]
      );

      if (producto.rows.length === 0) {
        throw new Error("Producto no encontrado");
      }

      if (producto.rows[0].stock < item.cantidad) {
        throw new Error("Stock insuficiente");
      }

      total += Number(producto.rows[0].precio) * item.cantidad;
    }

    const venta = await client.query(
      `INSERT INTO venta(fecha, total, id_cliente, id_empleado)
       VALUES (CURRENT_DATE, $1, $2, $3)
       RETURNING id_venta;`,
      [total, id_cliente, id_empleado]
    );

    const idVenta = venta.rows[0].id_venta;

    for (const item of productos) {
      const producto = await client.query(
        `SELECT precio
         FROM producto
         WHERE id_producto = $1;`,
        [item.id_producto]
      );

      const subtotal = Number(producto.rows[0].precio) * item.cantidad;

      await client.query(
        `INSERT INTO detalle_venta(id_venta, id_producto, cantidad, subtotal)
         VALUES ($1, $2, $3, $4);`,
        [idVenta, item.id_producto, item.cantidad, subtotal]
      );

      await client.query(
        `UPDATE producto
         SET stock = stock - $1
         WHERE id_producto = $2;`,
        [item.cantidad, item.id_producto]
      );
    }

    await client.query("COMMIT");

    res.json({
      mensaje: "Venta registrada correctamente",
      total
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      mensaje: "Error en la venta, se hizo ROLLBACK"
    });
  } finally {
    client.release();
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en puerto 3000");
});