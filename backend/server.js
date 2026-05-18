const express = require("express");
const cors = require("cors");
const session = require("express-session");
const pool = require("./db");

const app = express();

app.use(express.json());

app.use(cors({
  origin: ["http://localhost:8080"],
  credentials: true
}));

app.use(session({
  secret: "secreto_refrescos",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60
  }
}));

// ===============================
// MIDDLEWARES
// ===============================

function verificarSesion(req, res, next) {

  if (!req.session.usuario) {
    return res.status(401).json({
      mensaje: "Debe iniciar sesión"
    });
  }

  next();
}

function permitirRoles(rolesPermitidos) {

  return (req, res, next) => {

    const usuario = req.session.usuario;

    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {

      return res.status(403).json({
        mensaje: "No tiene permiso para esta acción"
      });

    }

    next();
  };
}

// ===============================
// RUTA PRINCIPAL
// ===============================

app.get("/", (req, res) => {
  res.send("API Tienda de Refrescos funcionando");
});

// ===============================
// LOGIN
// ===============================

app.post("/login", async (req, res) => {

  try {

    const { correo, password } = req.body;

    const resultado = await pool.query(
      `
      SELECT id_usuario, correo, nombre, rol
      FROM usuario
      WHERE correo = $1 AND password = $2
      `,
      [correo, password]
    );

    if (resultado.rows.length === 0) {

      return res.status(401).json({
        mensaje: "Credenciales incorrectas"
      });

    }

    req.session.usuario = resultado.rows[0];

    res.json({
      mensaje: "Login correcto",
      usuario: resultado.rows[0]
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      mensaje: "Error en login"
    });

  }

});

// ===============================
// SESION
// ===============================

app.get("/sesion", (req, res) => {

  if (!req.session.usuario) {

    return res.status(401).json({
      mensaje: "No hay sesión activa"
    });

  }

  res.json(req.session.usuario);

});

// ===============================
// LOGOUT
// ===============================

app.post("/logout", (req, res) => {

  req.session.destroy(() => {

    res.json({
      mensaje: "Sesión cerrada"
    });

  });

});

// ===============================
// PRODUCTOS
// ===============================

app.get(
  "/productos",
  verificarSesion,
  permitirRoles(["admin", "gerente", "cajero", "inventario"]),
  async (req, res) => {

    try {

      const resultado = await pool.query(`
        SELECT
          p.id_producto,
          p.nombre,
          p.precio,
          p.stock,
          c.nombre AS categoria,
          pr.nombre AS proveedor
        FROM producto p
        JOIN categoria c
        ON p.id_categoria = c.id_categoria
        JOIN proveedor pr
        ON p.id_proveedor = pr.id_proveedor
        ORDER BY p.id_producto
      `);

      res.json(resultado.rows);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        mensaje: "Error obteniendo productos"
      });

    }

  }
);

// ===============================
// AGREGAR PRODUCTO
// ===============================

app.post(
  "/productos",
  verificarSesion,
  permitirRoles(["admin", "inventario"]),
  async (req, res) => {

    try {

      const {
        nombre,
        precio,
        stock,
        id_categoria,
        id_proveedor
      } = req.body;

      await pool.query(
        `
        INSERT INTO producto
        (nombre, precio, stock, id_categoria, id_proveedor)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [nombre, precio, stock, id_categoria, id_proveedor]
      );

      res.json({
        mensaje: "Producto agregado"
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        mensaje: "No se pudo agregar el producto"
      });

    }

  }
);

// ===============================
// CLIENTES
// ===============================

app.get(
  "/clientes",
  verificarSesion,
  permitirRoles(["admin", "gerente", "cajero"]),
  async (req, res) => {

    try {

      const resultado = await pool.query(`
        SELECT *
        FROM cliente
        ORDER BY id_cliente
      `);

      res.json(resultado.rows);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        mensaje: "Error obteniendo clientes"
      });

    }

  }
);

// ===============================
// AGREGAR CLIENTE
// ===============================

app.post(
  "/clientes",
  verificarSesion,
  permitirRoles(["admin", "gerente"]),
  async (req, res) => {

    try {

      const { nombre, telefono } = req.body;

      await pool.query(
        `
        INSERT INTO cliente(nombre, telefono)
        VALUES ($1, $2)
        `,
        [nombre, telefono]
      );

      res.json({
        mensaje: "Cliente agregado"
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        mensaje: "No se pudo agregar el cliente"
      });

    }

  }
);

// ===============================
// REPORTE
// ===============================

app.get(
  "/reporte-ventas",
  verificarSesion,
  permitirRoles(["admin", "gerente", "reportes"]),
  async (req, res) => {

    try {

      const resultado = await pool.query(`
        SELECT *
        FROM vista_reporte_ventas
      `);

      res.json(resultado.rows);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        mensaje: "Error generando reporte"
      });

    }

  }
);

// ===============================
// CONSULTA JOIN
// ===============================

app.get(
  "/consulta-join",
  verificarSesion,
  permitirRoles(["admin", "gerente", "reportes"]),
  async (req, res) => {

    try {

      const resultado = await pool.query(`
        SELECT
          p.nombre AS producto,
          c.nombre AS categoria,
          pr.nombre AS proveedor
        FROM producto p
        JOIN categoria c
        ON p.id_categoria = c.id_categoria
        JOIN proveedor pr
        ON p.id_proveedor = pr.id_proveedor
      `);

      res.json(resultado.rows);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        mensaje: "Error en consulta JOIN"
      });

    }

  }
);

// ===============================
// CONSULTA GROUP BY
// ===============================

app.get(
  "/consulta-group",
  verificarSesion,
  permitirRoles(["admin", "gerente", "reportes"]),
  async (req, res) => {

    try {

      const resultado = await pool.query(`
        SELECT
          id_categoria,
          COUNT(*) AS total_productos
        FROM producto
        GROUP BY id_categoria
      `);

      res.json(resultado.rows);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        mensaje: "Error en GROUP BY"
      });

    }

  }
);

// ===============================
// CONSULTA CTE
// ===============================

app.get(
  "/consulta-cte",
  verificarSesion,
  permitirRoles(["admin", "gerente", "reportes"]),
  async (req, res) => {

    try {

      const resultado = await pool.query(`
        WITH productos_caros AS (
          SELECT *
          FROM producto
          WHERE precio > 10
        )
        SELECT *
        FROM productos_caros
      `);

      res.json(resultado.rows);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        mensaje: "Error en CTE"
      });

    }

  }
);

// ===============================
// VENTAS CON TRANSACCION
// ===============================

app.post(
  "/ventas",
  verificarSesion,
  permitirRoles(["admin", "gerente", "cajero"]),
  async (req, res) => {

    const client = await pool.connect();

    try {

      const {
        id_cliente,
        id_empleado,
        productos
      } = req.body;

      await client.query("BEGIN");

      let total = 0;

      for (const producto of productos) {

        const consultaStock = await client.query(
          `
          SELECT stock, precio
          FROM producto
          WHERE id_producto = $1
          `,
          [producto.id_producto]
        );

        const stockActual = consultaStock.rows[0].stock;
        const precio = consultaStock.rows[0].precio;

        if (stockActual < producto.cantidad) {

          await client.query("ROLLBACK");

          return res.status(400).json({
            mensaje: "Stock insuficiente"
          });

        }

        total += precio * producto.cantidad;

      }

      const venta = await client.query(
        `
        INSERT INTO venta(fecha, total, id_cliente, id_empleado)
        VALUES (CURRENT_DATE, $1, $2, $3)
        RETURNING id_venta
        `,
        [total, id_cliente, id_empleado]
      );

      const idVenta = venta.rows[0].id_venta;

      for (const producto of productos) {

        const consultaPrecio = await client.query(
          `
          SELECT precio
          FROM producto
          WHERE id_producto = $1
          `,
          [producto.id_producto]
        );

        const precio = consultaPrecio.rows[0].precio;

        await client.query(
          `
          INSERT INTO detalle_venta
          (id_venta, id_producto, cantidad, subtotal)
          VALUES ($1, $2, $3, $4)
          `,
          [
            idVenta,
            producto.id_producto,
            producto.cantidad,
            precio * producto.cantidad
          ]
        );

        await client.query(
          `
          UPDATE producto
          SET stock = stock - $1
          WHERE id_producto = $2
          `,
          [producto.cantidad, producto.id_producto]
        );

      }

      await client.query("COMMIT");

      res.json({
        mensaje: "Venta registrada correctamente"
      });

    } catch (error) {

      await client.query("ROLLBACK");

      console.log(error);

      res.status(500).json({
        mensaje: "Error registrando venta"
      });

    } finally {

      client.release();

    }

  }
);

// ===============================
// EXPORTAR CSV
// ===============================

app.get(
  "/exportar-reporte",
  verificarSesion,
  permitirRoles(["admin", "gerente", "reportes"]),
  async (req, res) => {

    try {

      const resultado = await pool.query(`
        SELECT *
        FROM vista_reporte_ventas
      `);

      let csv = "cliente,total,fecha\n";

      resultado.rows.forEach(fila => {

        csv += `${fila.cliente},${fila.total},${fila.fecha}\n`;

      });

      res.header("Content-Type", "text/csv");

      res.attachment("reporte.csv");

      res.send(csv);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        mensaje: "Error exportando CSV"
      });

    }

  }
);

// ===============================
// PUERTO
// ===============================

app.listen(3000, () => {

  console.log("Servidor corriendo en puerto 3000");

});