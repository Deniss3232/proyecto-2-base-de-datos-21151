CREATE ROLE rol_admin;
CREATE ROLE rol_gerente;
CREATE ROLE rol_cajero;
CREATE ROLE rol_inventario;
CREATE ROLE rol_reportes;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rol_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_admin;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO rol_gerente;
GRANT INSERT, UPDATE ON venta, detalle_venta TO rol_gerente;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_gerente;

GRANT SELECT ON producto, cliente TO rol_cajero;
GRANT SELECT, INSERT ON venta, detalle_venta TO rol_cajero;
GRANT UPDATE(stock) ON producto TO rol_cajero;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_cajero;

GRANT SELECT, INSERT, UPDATE ON producto, categoria, proveedor TO rol_inventario;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO rol_inventario;

GRANT SELECT ON vista_reporte_ventas TO rol_reportes;
GRANT SELECT ON producto, venta, detalle_venta, cliente, empleado TO rol_reportes;
