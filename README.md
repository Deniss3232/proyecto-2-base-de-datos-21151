#  Proyecto 2 - Tienda de Refrescos

Proyecto del curso **CC3088 - Bases de Datos 1**.

Este sistema simula una tienda de refrescos donde se puede manejar inventario, clientes y ventas. Incluye base de datos relacional, backend en Node.js, frontend web y despliegue completo con Docker.

---

##  Tecnologías utilizadas

- PostgreSQL 16
- Node.js + Express
- HTML, CSS y JavaScript
- Docker + Docker Compose

---

##  Cómo ejecutar el proyecto

Desde la carpeta raíz del proyecto:

```bash
docker compose up --build
y en el navegador: http://localhost:8080
```
## Credenciales
- Base de datos 
Usuario: proy2
Contraseña: secret
Base: tienda_refrescos
- Login
Correo: admin@refrescos.com
Contraseña: 1234

## Estructura del proyecto 
Proyecto2-Tienda-Refrescos/
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   └── Dockerfile
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── indexes.sql
├── frontend/
│   ├── index.html
│   └── Dockerfile
├── docker-compose.yml
├── README.md

## Funcionalidades 
Login y logout con sesión
CRUD de productos
CRUD de clientes
Registro de ventas
Actualización automática de stock
Reporte de ventas en la interfaz
Exportación de reporte a CSV
Manejo de errores visible para el usuario
Consultas SQL avanzadas desde la UI

## Base de datos 

Tablas principales:
categoria
proveedor
cliente
empleado
usuario
producto
venta
detalle_venta

## Consultas SQL implementadas

Desde la interfaz se pueden ejecutar:

JOIN entre múltiples tablas
Subqueries
GROUP BY y HAVING
CTE (WITH)
VIEW usada en reportes

## Transacciones
Los registros de ventas usan
BEGIN
COMMIT
ROLLBACK

## Endpoints 
POST /login
GET /sesion
POST /logout

GET /productos
POST /productos
PUT /productos/:id
DELETE /productos/:id

GET /clientes
POST /clientes
PUT /clientes/:id
DELETE /clientes/:id

POST /ventas

GET /reporte-ventas
GET /consulta-join
GET /consulta-subquery
GET /consulta-group
GET /consulta-cte
GET /exportar-reporte

## Puertos 
Frontend: http://localhost:8080
Backend: http://localhost:3000
Base de datos: localhost:5432
