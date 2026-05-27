const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "tienda_refrescos",
  process.env.DB_USER || "proy3",
  process.env.DB_PASSWORD || "secret",
  {
    host: process.env.DB_HOST || "db",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false
  }
);

const Producto = sequelize.define("producto", {
  id_producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: DataTypes.STRING,
  precio: DataTypes.DECIMAL,
  stock: DataTypes.INTEGER,
  id_categoria: DataTypes.INTEGER,
  id_proveedor: DataTypes.INTEGER
}, {
  tableName: "producto",
  timestamps: false
});

const Cliente = sequelize.define("cliente", {
  id_cliente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: DataTypes.STRING,
  telefono: DataTypes.STRING
}, {
  tableName: "cliente",
  timestamps: false
});

module.exports = {
  sequelize,
  Producto,
  Cliente
};
