INSERT INTO categoria(nombre) VALUES
('Gaseosas'),
('Jugos'),
('Energizantes');

INSERT INTO proveedor(nombre,telefono) VALUES
('Coca Cola GT','5555-1111'),
('Pepsi GT','5555-2222'),
('Red Bull GT','5555-3333');

INSERT INTO cliente(nombre,telefono) VALUES
('Denis Rodriguez','4444-1111'),
('Juan Perez','4444-2222');

INSERT INTO producto(nombre,precio,stock,id_categoria,id_proveedor) VALUES
('Coca Cola 600ml',8,50,1,1),
('Pepsi 600ml',7,45,1,2),
('Red Bull',18,20,3,3),
('Del Valle Mango',10,25,2,1);