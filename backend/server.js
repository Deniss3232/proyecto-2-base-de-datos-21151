const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando");
});

app.get("/productos", async (req, res) => {
  const resultado = await pool.query("SELECT * FROM producto");
  res.json(resultado.rows);
});

app.get("/ventas", async (req, res) => {
  const resultado = await pool.query("SELECT * FROM venta");
  res.json(resultado.rows);
});

app.listen(3000, () => {
  console.log("Servidor en puerto 3000");
});