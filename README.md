# Proyecto 2 y 3 - Tienda de Refrescos - Denis Rodríguez - 21151

Proyecto del curso **CC3088 - Bases de Datos 1**.

El sistema simula una tienda de refrescos donde se administran productos, clientes y ventas.  
La aplicación incluye autenticación por roles, stored procedures, ORM y despliegue completo con Docker.

---

## Tecnologías utilizadas

- PostgreSQL 16
- Node.js
- Express
- Sequelize ORM
- HTML
- CSS
- JavaScript
- Docker
- Docker Compose

---

## Cómo ejecutar el proyecto

Desde la carpeta raíz ejecutar:

```bash
docker compose up --build
```

---

## Puertos utilizados

| Servicio | Puerto |
|---|---|
| Frontend | 8080 |
| Backend | 3000 |
| PostgreSQL | 5432 |

---

## Credenciales de base de datos

```txt
Usuario: proy3
Contraseña: secret
Base de datos: tienda_refrescos
```

---

## Proyecto 3 - Usuarios de prueba y roles

El sistema implementa autenticación con sesiones y control de acceso basado en roles.

### Usuarios disponibles

| Rol | Correo | Contraseña |
|---|---|---|
| Admin | admin@refrescos.com | 1234 |
| Gerente | gerente@refrescos.com | 1234 |
| Cajero | cajero@refrescos.com | 1234 |
| Inventario | inventario@refrescos.com | 1234 |
| Reportes | reportes@refrescos.com | 1234 |

---

## Control de acceso

### Admin
- Acceso completo al sistema

### Gerente
- Reportes
- Ventas
- Consultas

### Cajero
- Productos
- Clientes
- Ventas

### Inventario
- Gestión de productos e inventario

### Reportes
- Consultas SQL
- Reportes de ventas

---

## Seguridad implementada

- Login y logout con sesiones
- Middleware de autenticación
- Middleware de autorización por roles
- Protección de rutas en backend
- Roles creados directamente en PostgreSQL
- Uso de:
  - CREATE ROLE
  - GRANT
  - REVOKE

---

## Stored Procedures implementados

- sp_crear_producto
- sp_actualizar_stock
- sp_crear_cliente
- sp_actualizar_cliente
- sp_registrar_venta

Los stored procedures son invocados desde el backend usando `CALL`.

---

## ORM utilizado

El proyecto utiliza Sequelize ORM para operaciones CRUD de:

- Productos
- Clientes

---

## Docker

La aplicación se ejecuta utilizando tres contenedores:

- PostgreSQL
- Backend Node.js
- Frontend web

Todo el sistema puede levantarse usando:

```bash
docker compose up --build
```
