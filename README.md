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

---

## Proyecto 3 Usuarios de prueba y roles

El sistema implementa autenticación con sesiones y control de acceso basado en roles.

### Usuarios disponibles

| Rol | Correo | Contraseña |
|---|---|---|
| Admin | admin@refrescos.com | 1234 |
| Gerente | gerente@refrescos.com | 1234 |
| Cajero | cajero@refrescos.com | 1234 |
| Inventario | inventario@refrescos.com | 1234 |
| Reportes | reportes@refrescos.com | 1234 |

### Control de acceso

- Admin:
  - Acceso completo al sistema.

- Gerente:
  - Reportes, ventas y consultas.

- Cajero:
  - Productos, clientes y ventas.

- Inventario:
  - Gestión de productos e inventario.

- Reportes:
  - Consultas SQL y reportes de ventas.

---

## Seguridad implementada

- Uso de sesiones con `express-session`
- Protección de rutas en backend
- Middleware de autenticación
- Middleware de autorización por roles
- Roles creados con:
  - `CREATE ROLE`
  - `GRANT`
  - `REVOKE`