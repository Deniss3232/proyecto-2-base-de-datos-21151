const express = require("express");
const cors = require("cors");
const session = require("express-session");
const pool = require("./db");
const { sequelize, Producto, Cliente } = require("./orm");

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

app.get("/", (req, res) => {
  res.send("API Tienda de Refrescos funcionando");
});

// LOGIN Y SESIÓN

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

app.get("/sesion", (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({
      mensaje: "No hay sesión activa"
    });
  }

  res.json(req.session.usuario);
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({
      mensaje: "Sesión cerrada"
    });
  });
});


// CATÁLOGOS

app.get(
  "/categorias",
  verificarSesion,
  permitirRoles(["admin", "gerente", "cajero", "inventario", "reportes"]),
  async (req, res) => {
    try {
      const resultado = await pool.query(`
        SELECT *
        FROM categoria
        ORDER BY id_categoria
      `);

      res.json(resultado.rows);
    } catch (error) {
      res.status(500).json({
        mensaje: "Error obteniendo categorías"
      });
    }
  }
);

app.get(
  "/proveedores",
  verificarSesion,
  permitirRoles(["admin", "gerente", "inventario"]),
  async (req, res) => {
    try {
      const resultado = await pool.query(`
        SELECT *
        FROM proveedor
        ORDER BY id_proveedor
      `);

      res.json(resultado.rows);
    } catch (error) {
      res.status(500).json({
        mensaje: "Error obteniendo proveedores"
      });
    }
  }
);

app.get(
  "/empleados",
  verificarSesion,
  permitirRoles(["admin", "gerente", "cajero"]),
  async (req, res) => {
    try {
      const resultado = await pool.query(`
        SELECT *
        FROM empleado
        ORDER BY id_empleado
      `);

      res.json(resultado.rows);
    } catch (error) {
      res.status(500).json({
        mensaje: "Error obteniendo empleados"
      });
    }
  }
);

// PRODUCTOS - ORM Y PROCEDURES

app.get(
  "/productos",
  verificarSesion,
  permitirRoles(["admin", "gerente", "cajero", "inventario", "reportes"]),
  async (req, res) => {
    try {
      const productos = await Producto.findAll({
        order: [["id_producto", "ASC"]]
      });

      res.json(productos);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        mensaje: "Error obteniendo productos"
      });
    }
  }
);

app.post(
  "/productos",
  verificarSesion,
  permitirRoles(["admin", "inventario"]),
  async (req, res) => {
    try {
      const { nombre, precio, stock, id_categoria, id_proveedor } = req.body;

      await pool.query(
        `
        CALL sp_crear_producto($1, $2, $3, $4, $5)
        `,
        [nombre, precio, stock, id_categoria, id_proveedor]
      );

      res.json({
        mensaje: "Producto agregado usando stored procedure"
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        mensaje: "No se pudo agregar el producto"
      });
    }
  }
);

app.put(
  "/productos/:id",
  verificarSesion,
  permitirRoles(["admin", "inventario"]),
  async (req, res) => {
    try {
      const { nombre, precio, stock } = req.body;

      const producto = await Producto.findByPk(req.params.id);

      if (!producto) {
        return res.status(404).json({
          mensaje: "Producto no encontrado"
        });
      }

      producto.nombre = nombre;
      producto.precio = precio;
      producto.stock = stock;

      await producto.save();

      res.json({
        mensaje: "Producto actualizado usando ORM",
        producto
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        mensaje: "No se pudo actualizar el producto"
      });
    }
  }
);

app.patch(
  "/productos/:id/stock",
  verificarSesion,
  permitirRoles(["admin", "inventario"]),
  async (req, res) => {
    try {
      const { stock } = req.body;

      await pool.query(
        `
        CALL sp_actualizar_stock($1, $2)
        `,
        [req.params.id, stock]
      );

      res.json({
        mensaje: "Stock actualizado usando stored procedure"
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        mensaje: "No se pudo actualizar el stock"
      });
    }
  }
);

app.delete(
  "/productos/:id",
  verificarSesion,
  permitirRoles(["admin"]),
  async (req, res) => {
    try {
      const eliminado = await Producto.destroy({
        where: {
          id_producto: req.params.id
        }
      });

      if (eliminado === 0) {
        return res.status(404).json({
          mensaje: "Producto no encontrado"
        });
      }

      res.json({
        mensaje: "Producto eliminado usando ORM"
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        mensaje: "No se pudo eliminar el producto"
      });
    }
  }
);

// CLIENTES - ORM Y PROCEDURES

app.get(
  "/clientes",
  verificarSesion,
  permitirRoles(["admin", "gerente", "cajero"]),
  async (req, res) => {
    try {
      const clientes = await Cliente.findAll({
        order: [["id_cliente", "ASC"]]
      });

      res.json(clientes);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        mensaje: "Error obteniendo clientes"
      });
    }
  }
);

app.post(
  "/clientes",
  verificarSesion,
  permitirRoles(["admin", "gerente"]),
  async (req, res) => {
    try {
      const { nombre, telefono } = req.body;

      await pool.query(
        `
        CALL sp_crear_cliente($1, $2)
        `,
        [nombre, telefono]
      );

      res.json({
        mensaje: "Cliente agregado usando stored procedure"
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        mensaje: "No se pudo agregar el cliente"
      });
    }
  }
);

app.put(
  "/clientes/:id",
  verificarSesion,
  permitirRoles(["admin", "gerente"]),
  async (req, res) => {
    try {
      const { nombre, telefono } = req.body;

      await pool.query(
        `
        CALL sp_actualizar_cliente($1, $2, $3)
        `,
        [req.params.id, nombre, telefono]
      );

      res.json({
        mensaje: "Cliente actualizado usando stored procedure"
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        mensaje: "No se pudo actualizar el cliente"
      });
    }
  }
);

app.delete(
  "/clientes/:id",
  verificarSesion,
  permitirRoles(["admin"]),
  async (req, res) => {
    try {
      const eliminado = await Cliente.destroy({
        where: {
          id_cliente: req.params.id
        }
      });

      if (eliminado === 0) {
        return res.status(404).json({
          mensaje: "Cliente no encontrado"
        });
      }

      res.json({
        mensaje: "Cliente eliminado usando ORM"
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        mensaje: "No se pudo eliminar el cliente"
      });
    }
  }
);

// REPORTES Y CONSULTAS

app.get(
  "/reporte-ventas",
  verificarSesion,
  permitirRoles(["admin", "gerente", "reportes"]),
  async (req, res) => {
    try {
      const resultado = await pool.query(`
        SELECT *
        FROM vista_reporte_ventas
        ORDER BY id_venta
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
        JOIN categoria c ON p.id_categoria = c.id_categoria
        JOIN proveedor pr ON p.id_proveedor = pr.id_proveedor
      `);

      res.json(resultado.rows);
    } catch (error) {
      res.status(500).json({
        mensaje: "Error en consulta JOIN"
      });
    }
  }
);

app.get(
  "/consulta-subquery",
  verificarSesion,
  permitirRoles(["admin", "gerente", "reportes"]),
  async (req, res) => {
    try {
      const resultado = await pool.query(`
        SELECT nombre, precio
        FROM producto
        WHERE precio > (
          SELECT AVG(precio)
          FROM producto
        )
      `);

      res.json(resultado.rows);
    } catch (error) {
      res.status(500).json({
        mensaje: "Error en subquery"
      });
    }
  }
);

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
        HAVING COUNT(*) >= 1
      `);

      res.json(resultado.rows);
    } catch (error) {
      res.status(500).json({
        mensaje: "Error en GROUP BY"
      });
    }
  }
);

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
      res.status(500).json({
        mensaje: "Error en CTE"
      });
    }
  }
);

// VENTAS - STORED PROCEDURE CON TRANSACCIÓN

app.post(
  "/ventas",
  verificarSesion,
  permitirRoles(["admin", "gerente", "cajero"]),
  async (req, res) => {
    try {
      const { productos } = req.body;

      if (!productos || productos.length === 0) {
        return res.status(400).json({
          mensaje: "Debe seleccionar al menos un producto"
        });
      }

      const item = productos[0];

      await pool.query(
        `
        CALL sp_registrar_venta($1, $2)
        `,
        [item.id_producto, item.cantidad]
      );

      res.json({
        mensaje: "Venta registrada usando stored procedure con validación"
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        mensaje: "Error registrando venta mediante stored procedure"
      });
    }
  }
);

// EXPORTAR CSV

app.get(
  "/exportar-reporte",
  verificarSesion,
  permitirRoles(["admin", "gerente", "reportes"]),
  async (req, res) => {
    try {
      const resultado = await pool.query(`
        SELECT *
        FROM vista_reporte_ventas
        ORDER BY id_venta
      `);

      let csv = "id_venta,fecha,cliente,empleado,total\n";

      resultado.rows.forEach(fila => {
        csv += `${fila.id_venta},${fila.fecha},${fila.cliente},${fila.empleado},${fila.total}\n`;
      });

      res.header("Content-Type", "text/csv");
      res.attachment("reporte.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({
        mensaje: "Error exportando CSV"
      });
    }
  }
);

// INICIO

app.listen(3000, async () => {
  try {
    await sequelize.authenticate();
    console.log("ORM conectado correctamente");
  } catch (error) {
    console.log("No se pudo conectar el ORM");
    console.log(error);
  }

  console.log("Servidor corriendo en puerto 3000");
});