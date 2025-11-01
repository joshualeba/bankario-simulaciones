-- ========= SECCIÓN 1: CREACIÓN DE TABLAS =========

-- Tabla para datos personales generales
CREATE TABLE DatosP (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(255) NOT NULL,
    apellidoP VARCHAR(255),
    apellidoM VARCHAR(255),
    fecha_nacimiento DATETIME NOT NULL DEFAULT GETDATE(),
    telefono BIGINT
);
GO

-- Tabla para los usuarios de la aplicación
CREATE TABLE usuarios (
    id INT PRIMARY KEY IDENTITY(1,1),
    id_datosP INT,
    correo_electronico NVARCHAR(255) NOT NULL UNIQUE,
    contrasena NVARCHAR(255) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE(),
    ultima_sesion DATETIME,
    test_completado BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (id_datosP) REFERENCES DatosP(id)
);
GO

-- Tablas para la estructura del test
CREATE TABLE Tipo_Preguntas (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(255)
);
GO

CREATE TABLE Dificultades (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(255)
);
GO

CREATE TABLE Categorias (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(255)
);
GO

CREATE TABLE preguntas_test (
    id INT PRIMARY KEY IDENTITY(1,1),
    pregunta NVARCHAR(MAX) NOT NULL,
    id_tipoPregunta INT,
    id_dificultad INT,
    id_categoria INT,
    respuesta_texto_correcta NVARCHAR(500),
    FOREIGN KEY (id_tipoPregunta) REFERENCES Tipo_Preguntas(id),
    FOREIGN KEY (id_dificultad) REFERENCES Dificultades(id),
    FOREIGN KEY (id_categoria) REFERENCES Categorias(id)
);
GO

CREATE TABLE opciones_respuesta (
    id INT PRIMARY KEY IDENTITY(1,1),
    pregunta_id INT NOT NULL,
    texto_opcion NVARCHAR(500) NOT NULL,
    es_correcta BIT NOT NULL,
    FOREIGN KEY (pregunta_id) REFERENCES preguntas_test(id) ON DELETE CASCADE
);
GO

CREATE TABLE resultados_test (
    id INT PRIMARY KEY IDENTITY(1,1),
    usuario_id INT NOT NULL,
    puntuacion INT NOT NULL,
    total_preguntas INT NOT NULL,
    puntuacion_total INT NOT NULL DEFAULT 0,
    tiempo_resolucion_segundos DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fecha_realizacion DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
GO

-- Tablas para la estructura de negocio (sucursales, clientes, empleados)
CREATE TABLE Estados (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100)
);
GO

CREATE TABLE Ciudades (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100),
    id_Estado INT,
    FOREIGN KEY (id_Estado) REFERENCES Estados(id)
);
GO

CREATE TABLE Sucursales (
    id INT PRIMARY KEY IDENTITY(1,1),
    id_Ciudad INT,
    FOREIGN KEY (id_Ciudad) REFERENCES Ciudades(id)
);
GO

CREATE TABLE Generos (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(70)
);
GO

CREATE TABLE Clientes (
    id INT PRIMARY KEY IDENTITY(1,1),
    id_usuario INT NOT NULL UNIQUE,
    id_Sucursal INT,
    id_Genero INT,
    fecha_registro DATE DEFAULT GETDATE(),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY (id_Sucursal) REFERENCES Sucursales(id),
    FOREIGN KEY (id_Genero) REFERENCES Generos(id)
);
GO

CREATE TABLE Estatus (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(50)
);
GO

CREATE TABLE Puestos (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100)
);
GO

CREATE TABLE Empleados (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100),
    apellidoPaterno VARCHAR(100),
    apellidoMaterno VARCHAR(100),
    id_Puesto INT,
    id_Sucursal INT,
    id_Estatus INT,
    id_genero INT,
    FOREIGN KEY (id_genero) REFERENCES Generos(id),
    FOREIGN KEY (id_Puesto) REFERENCES Puestos(id),
    FOREIGN KEY (id_Sucursal) REFERENCES Sucursales(id),
    FOREIGN KEY (id_Estatus) REFERENCES Estatus(id)
);
GO


-- ========= SECCIÓN 2: INSERCIÓN DE DATOS (INSERTS) =========

-- Datos iniciales para el test
INSERT INTO Tipo_Preguntas (nombre) VALUES ('multiple_choice'), ('true_false'), ('fill_in_the_blank');
INSERT INTO Dificultades (nombre) VALUES ('facil'), ('medio'), ('dificil');
INSERT INTO Categorias (nombre) VALUES ('ahorro'), ('seguros'), ('presupuesto'), ('economía'), ('inversiones'), ('deuda'), ('ingresos');

-- Preguntas y respuestas del test
-- Pregunta 1
INSERT INTO preguntas_test (pregunta, id_tipoPregunta, id_dificultad, id_categoria) VALUES ('¿qué es el interés simple?', (SELECT id FROM Tipo_Preguntas WHERE nombre = 'multiple_choice'), (SELECT id FROM Dificultades WHERE nombre = 'facil'), (SELECT id FROM Categorias WHERE nombre = 'ahorro'));
INSERT INTO opciones_respuesta (pregunta_id, texto_opcion, es_correcta) VALUES
((SELECT id FROM preguntas_test WHERE pregunta = '¿Qué es el interés simple?'), 'Intereses calculados solo sobre el capital inicial.', 1),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Qué es el interés simple?'), 'Intereses calculados sobre el capital y los intereses acumulados.', 0),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Qué es el interés simple?'), 'Un porcentaje fijo aplicado mensualmente.', 0),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Qué es el interés simple?'), 'La ganancia de capital en una inversión.', 0);

-- Pregunta 2
INSERT INTO preguntas_test (pregunta, id_tipoPregunta, id_dificultad, id_categoria) VALUES ('el seguro de vida es una forma de inversión.', (SELECT id FROM Tipo_Preguntas WHERE nombre = 'true_false'), (SELECT id FROM Dificultades WHERE nombre = 'facil'), (SELECT id FROM Categorias WHERE nombre = 'seguros'));
INSERT INTO opciones_respuesta (pregunta_id, texto_opcion, es_correcta) VALUES
((SELECT id FROM preguntas_test WHERE pregunta = 'El seguro de vida es una forma de inversión.'), 'Verdadero', 0),
((SELECT id FROM preguntas_test WHERE pregunta = 'El seguro de vida es una forma de inversión.'), 'Falso', 1);

-- Pregunta 3
INSERT INTO preguntas_test (pregunta, id_tipoPregunta, id_dificultad, id_categoria, respuesta_texto_correcta) VALUES ('El ______ compuesto permite que tus intereses generen más intereses con el tiempo.', (SELECT id FROM Tipo_Preguntas WHERE nombre = 'fill_in_the_blank'), (SELECT id FROM Dificultades WHERE nombre = 'facil'), (SELECT id FROM Categorias WHERE nombre = 'Ahorro'), 'Interés');

-- Pregunta 4
INSERT INTO preguntas_test (pregunta, id_tipoPregunta, id_dificultad, id_categoria) VALUES ('¿Cuál de los siguientes es un gasto fijo?', (SELECT id FROM Tipo_Preguntas WHERE nombre = 'multiple_choice'), (SELECT id FROM Dificultades WHERE nombre = 'medio'), (SELECT id FROM Categorias WHERE nombre = 'presupuesto'));
INSERT INTO opciones_respuesta (pregunta_id, texto_opcion, es_correcta) VALUES
((SELECT id FROM preguntas_test WHERE pregunta = '¿Cuál de los siguientes es un gasto fijo?'), 'Comidas en restaurantes.', 0),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Cuál de los siguientes es un gasto fijo?'), 'Alquiler.', 1),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Cuál de los siguientes es un gasto fijo?'), 'Entretenimiento.', 0),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Cuál de los siguientes es un gasto fijo?'), 'Ropa nueva.', 0);

-- Pregunta 5
INSERT INTO preguntas_test (pregunta, id_tipoPregunta, id_dificultad, id_categoria) VALUES ('Los fondos de emergencia deben ser fáciles de acceder.', (SELECT id FROM Tipo_Preguntas WHERE nombre = 'true_false'), (SELECT id FROM Dificultades WHERE nombre = 'medio'), (SELECT id FROM Categorias WHERE nombre = 'ahorro'));
INSERT INTO opciones_respuesta (pregunta_id, texto_opcion, es_correcta) VALUES
((SELECT id FROM preguntas_test WHERE pregunta = 'Los fondos de emergencia deben ser fáciles de acceder.'), 'Verdadero', 1),
((SELECT id FROM preguntas_test WHERE pregunta = 'Los fondos de emergencia deben ser fáciles de acceder.'), 'Falso', 0);

-- Pregunta 6
INSERT INTO preguntas_test (pregunta, id_tipoPregunta, id_dificultad, id_categoria, respuesta_texto_correcta) VALUES ('La inflación reduce el ______ de tu dinero con el tiempo.', (SELECT id FROM Tipo_Preguntas WHERE nombre = 'fill_in_the_blank'), (SELECT id FROM Dificultades WHERE nombre = 'medio'), (SELECT id FROM Categorias WHERE nombre = 'economía'), 'poder adquisitivo');

-- Pregunta 7
INSERT INTO preguntas_test (pregunta, id_tipoPregunta, id_dificultad, id_categoria) VALUES ('¿Qué es un fondo mutuo?', (SELECT id FROM Tipo_Preguntas WHERE nombre = 'multiple_choice'), (SELECT id FROM Dificultades WHERE nombre = 'medio'), (SELECT id FROM Categorias WHERE nombre = 'inversiones'));
INSERT INTO opciones_respuesta (pregunta_id, texto_opcion, es_correcta) VALUES
((SELECT id FROM preguntas_test WHERE pregunta = '¿Qué es un fondo mutuo?'), 'Un tipo de préstamo bancario.', 0),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Qué es un fondo mutuo?'), 'Una cuenta de ahorro de alto rendimiento.', 0),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Qué es un fondo mutuo?'), 'Un vehículo de inversión que agrupa dinero de múltiples inversores.', 1),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Qué es un fondo mutuo?'), 'Una tarjeta de crédito con beneficios.', 0);

-- Pregunta 8
INSERT INTO preguntas_test (pregunta, id_tipoPregunta, id_dificultad, id_categoria) VALUES ('Pagar solo el mínimo de tu tarjeta de crédito te ayudará a salir de la deuda rápidamente.', (SELECT id FROM Tipo_Preguntas WHERE nombre = 'true_false'), (SELECT id FROM Dificultades WHERE nombre = 'dificil'), (SELECT id FROM Categorias WHERE nombre = 'deuda'));
INSERT INTO opciones_respuesta (pregunta_id, texto_opcion, es_correcta) VALUES
((SELECT id FROM preguntas_test WHERE pregunta = 'Pagar solo el mínimo de tu tarjeta de crédito te ayudará a salir de la deuda rápidamente.'), 'Verdadero', 0),
((SELECT id FROM preguntas_test WHERE pregunta = 'Pagar solo el mínimo de tu tarjeta de crédito te ayudará a salir de la deuda rápidamente.'), 'Falso', 1);

-- Pregunta 9
INSERT INTO preguntas_test (pregunta, id_tipoPregunta, id_dificultad, id_categoria, respuesta_texto_correcta) VALUES ('El ______ es la cantidad de dinero que ganas antes de que se deduzcan los impuestos y otras retenciones.', (SELECT id FROM Tipo_Preguntas WHERE nombre = 'fill_in_the_blank'), (SELECT id FROM Dificultades WHERE nombre = 'facil'), (SELECT id FROM Categorias WHERE nombre = 'ingresos'), 'salario bruto');

-- Pregunta 10
INSERT INTO preguntas_test (pregunta, id_tipoPregunta, id_dificultad, id_categoria) VALUES ('¿Cuál es un beneficio clave de diversificar tus inversiones?', (SELECT id FROM Tipo_Preguntas WHERE nombre = 'multiple_choice'), (SELECT id FROM Dificultades WHERE nombre = 'dificil'), (SELECT id FROM Categorias WHERE nombre = 'inversiones'));
INSERT INTO opciones_respuesta (pregunta_id, texto_opcion, es_correcta) VALUES
((SELECT id FROM preguntas_test WHERE pregunta = '¿Cuál es un beneficio clave de diversificar tus inversiones?'), 'Garantiza mayores rendimientos.', 0),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Cuál es un beneficio clave de diversificar tus inversiones?'), 'Reduce el riesgo general de la cartera.', 1),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Cuál es un beneficio clave de diversificar tus inversiones?'), 'Aumenta la liquidez de tus activos.', 0),
((SELECT id FROM preguntas_test WHERE pregunta = '¿Cuál es un beneficio clave de diversificar tus inversiones?'), 'Elimina la necesidad de investigación de mercado.', 0);

-- Datos de negocio
INSERT INTO Estados (nombre) VALUES ('Monterrey'), ('Querétaro'), ('Guadalajara');
INSERT INTO Ciudades (nombre, id_Estado) VALUES
('Monterrey Centro', 1), ('San Nicolás', 1), ('Guadalupe', 1),
('Querétaro Centro', 2), ('Corregidora', 2), ('El Marqués', 2),
('Guadalajara Centro', 3), ('Zapopan', 3), ('Tlaquepaque', 3), ('Tonalá', 3);
INSERT INTO Sucursales (id_Ciudad) VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9);
INSERT INTO Generos (nombre) VALUES ('Hombre'), ('Mujer'), ('Otros');
INSERT INTO Estatus (nombre) VALUES ('Activo'), ('Inactivo'), ('Suspendido'), ('En proceso'), ('Cancelado'), ('Pendiente'), ('Finalizado'), ('Archivado'), ('Revisado'), ('En espera');
INSERT INTO Puestos (nombre) VALUES ('Gerente'), ('Cajero'), ('Atención al cliente'), ('Vendedor'), ('Supervisor'), ('Contador'), ('Auxiliar administrativo'), ('Analista'), ('Director'), ('Jefe de sucursal');

-- Datos de ejemplo para personas, usuarios, clientes y empleados
INSERT INTO DatosP (nombre, apellidoP, apellidoM, fecha_nacimiento, telefono) VALUES
('Paola Montserrat', 'Bautista', 'Sandoval', '1985-01-01', 8112345678),
('Moises', 'Becerril', 'Alvarez', '1982-02-02', 8123456789),
('Joshua Moises', 'Cervantes', 'Arredondo', '1990-03-03', 8134567890),
('Christian Giovanni', 'Contreras', 'Zozaya', '1988-04-04', 8145678901),
('Diego Antonio', 'Garcia', 'Garcia', '1979-05-05', 8156789012),
('Arianna Valentina', 'Giannoccaro', 'Quiñonez', '1992-06-06', 8167890123),
('Artemio', 'Hurtado', 'Hernandez', '1987-07-07', 8178901234),
('Cristian', 'Hurtado', 'Lucas', '1991-08-08', 8189012345),
('Diego', 'Jimenez', 'Vargas', '1983-09-09', 8190123456),
('Emiliano', 'Ledesma', 'Ledesma', '1980-10-10', 8101234567);

INSERT INTO usuarios (id_datosP, correo_electronico, contrasena) VALUES
(1, 'paola.bautista@example.com', 'pass123'),
(2, 'moises.becerril@example.com', 'pass123'),
(3, 'joshua.cervantes@example.com', 'pass123'),
(4, 'christian.contreras@example.com', 'pass123'),
(5, 'diego.garcia@example.com', 'pass123'),
(6, 'arianna.giannoccaro@example.com', 'pass123'),
(7, 'artemio.hurtado@example.com', 'pass123'),
(8, 'cristian.hurtado@example.com', 'pass123'),
(9, 'diego.jimenez@example.com', 'pass123'),
(10, 'emiliano.ledesma@example.com', 'pass123');

INSERT INTO Clientes (id_usuario, id_Sucursal, id_Genero) VALUES
(1, 1, 2), (2, 2, 1), (3, 3, 1), (4, 4, 1), (5, 5, 1),
(6, 6, 2), (7, 7, 1), (8, 8, 1), (9, 9, 1), (10, 1, 1);

INSERT INTO Empleados (nombre, apellidoPaterno, apellidoMaterno, id_Puesto, id_Sucursal, id_Estatus, id_genero) VALUES
('Andres Joshua', 'Leon', 'Barranco', 1, 1, 1, 1),
('Eduardo Daniel', 'Licea', 'Gonzalez', 2, 2, 1, 1),
('Jorge Armando', 'Lopez', 'Morales', 3, 3, 1, 1),
('Santiago', 'Lugo', 'Sanchez', 4, 4, 1, 1),
('Saul Alejandro', 'Maldonado', 'Ladrillero', 5, 5, 1, 1),
('Fabiola', 'Martinez', 'Rauda', 6, 6, 1, 2),
('Coral', 'Martinez', 'Silvestre', 7, 7, 1, 2),
('Tania', 'Mejia', 'Moreno', 8, 8, 1, 2),
('Ricardo', 'Mendez', 'Rodriguez', 9, 9, 1, 1),
('Marlon Raul', 'Mendieta', 'Valadez', 10, 1, 1, 1);

INSERT INTO resultados_test (usuario_id, puntuacion, total_preguntas, puntuacion_total, tiempo_resolucion_segundos) VALUES
(1, 8, 10, 80, 120.50), (2, 7, 10, 70, 130.25), (3, 9, 10, 90, 110.75),
(4, 6, 10, 60, 140.00), (5, 10, 10, 100, 105.30), (6, 7, 10, 70, 125.00),
(7, 8, 10, 80, 115.90), (8, 5, 10, 50, 150.10), (9, 9, 10, 90, 100.00),
(10, 6, 10, 60, 135.45);
GO


-- ========= SECCIÓN 3: PROCEDIMIENTOS ALMACENADOS =========

-- Procedimiento: Crear un nuevo usuario
DROP PROCEDURE IF EXISTS sp_crear_nuevo_usuario;
GO
CREATE PROCEDURE sp_crear_nuevo_usuario
    @nombre_persona NVARCHAR(255),
    @apellidop NVARCHAR(255),
    @apellidom NVARCHAR(255),
    @telefono BIGINT,
    @fecha_nacimiento DATETIME,
    @email_persona NVARCHAR(255),
    @contrasena_segura NVARCHAR(255)
AS
BEGIN
    BEGIN TRY
        SET NOCOUNT ON;
        INSERT INTO DatosP (nombre, apellidoP, apellidoM, telefono, fecha_nacimiento) VALUES (@nombre_persona, @apellidop, @apellidom, @telefono, @fecha_nacimiento);
        DECLARE @id_datosp INT = SCOPE_IDENTITY();
        INSERT INTO usuarios (id_datosP, correo_electronico, contrasena) VALUES (@id_datosp, @email_persona, @contrasena_segura);
        DECLARE @id_usuario INT = SCOPE_IDENTITY();
        SELECT @id_usuario AS id_del_usuario_nuevo;
    END TRY
    BEGIN CATCH
        PRINT CONCAT('Error ', ERROR_NUMBER(), ' en la linea ', ERROR_LINE(), ': ', ERROR_MESSAGE());
        ROLLBACK TRANSACTION;
    END CATCH
END;
GO




-- Procedimiento: Ver información completa de un usuario
DROP PROCEDURE IF EXISTS sp_ver_info_usuario;
GO
CREATE PROCEDURE sp_ver_info_usuario
    @id_de_usuario INT
AS
BEGIN
    BEGIN TRY
        SET NOCOUNT ON;
        SELECT
            u.id, dp.nombre, dp.apellidoP, dp.apellidoM, dp.telefono, dp.fecha_nacimiento,
            u.correo_electronico, u.fecha_registro, u.ultima_sesion, u.test_completado
        FROM usuarios u
        INNER JOIN DatosP dp ON u.id_datosP = dp.id
        WHERE u.id = @id_de_usuario;
    END TRY
    BEGIN CATCH
        PRINT CONCAT('Error ', ERROR_NUMBER(), ' en la linea ', ERROR_LINE(), ': ', ERROR_MESSAGE());
        ROLLBACK TRANSACTION;
    END CATCH
END;
GO




-- Procedimiento: Guardar resultados del test
DROP PROCEDURE IF EXISTS sp_guardar_test_completado;
GO
CREATE PROCEDURE sp_guardar_test_completado
    @id_usuario_del_test INT,
    @respuestas_correctas INT,
    @cantidad_total_preguntas INT,
    @puntuacion_final_con_tiempo INT,
    @tiempo_segundos DECIMAL(10, 2)
AS
BEGIN
    BEGIN TRY
        SET NOCOUNT ON;
        INSERT INTO resultados_test (usuario_id, puntuacion, total_preguntas, puntuacion_total, tiempo_resolucion_segundos)
        VALUES (@id_usuario_del_test, @respuestas_correctas, @cantidad_total_preguntas, @puntuacion_final_con_tiempo, @tiempo_segundos);
        UPDATE usuarios SET test_completado = 1 WHERE id = @id_usuario_del_test;
    END TRY
    BEGIN CATCH
        PRINT CONCAT('Error ', ERROR_NUMBER(), ' en la linea ', ERROR_LINE(), ': ', ERROR_MESSAGE());
        ROLLBACK TRANSACTION;
    END CATCH
END;
GO




-- Procedimiento: Ver todas las preguntas y opciones
DROP PROCEDURE IF EXISTS sp_ver_todas_las_preguntas_del_test;
GO
CREATE PROCEDURE sp_ver_todas_las_preguntas_del_test
AS
BEGIN
    BEGIN TRY
        SET NOCOUNT ON;
        SELECT
            pt.id AS id_de_pregunta, pt.pregunta, tp.nombre AS tipo_pregunta, d.nombre AS dificultad,
            c.nombre AS categoria, pt.respuesta_texto_correcta, orl.id AS id_de_opcion,
            orl.texto_opcion, orl.es_correcta
        FROM preguntas_test pt
        LEFT JOIN Tipo_Preguntas tp ON pt.id_tipoPregunta = tp.id
        LEFT JOIN Dificultades d ON pt.id_dificultad = d.id
        LEFT JOIN Categorias c ON pt.id_categoria = c.id
        LEFT JOIN opciones_respuesta orl ON pt.id = orl.pregunta_id
        ORDER BY pt.id, orl.id;
    END TRY
    BEGIN CATCH
        PRINT CONCAT('Error ', ERROR_NUMBER(), ' en la linea ', ERROR_LINE(), ': ', ERROR_MESSAGE());
        ROLLBACK TRANSACTION;
    END CATCH
END;
GO




-- Procedimiento: Actualizar fecha de ultima sesion
DROP PROCEDURE IF EXISTS sp_actualizar_fecha_ultima_sesion;
GO
CREATE PROCEDURE sp_actualizar_fecha_ultima_sesion
    @id_usuario_que_entro INT
AS
BEGIN
    BEGIN TRY
        SET NOCOUNT ON;
        UPDATE usuarios SET ultima_sesion = GETDATE() WHERE id = @id_usuario_que_entro;
    END TRY
    BEGIN CATCH
        PRINT CONCAT('Error ', ERROR_NUMBER(), ' en la linea ', ERROR_LINE(), ': ', ERROR_MESSAGE());
        ROLLBACK TRANSACTION;
    END CATCH
END;
GO





-- ========= SECCIÓN 4: DISPARADORES (TRIGGERS) =========

DROP TRIGGER IF EXISTS tr_actualizar_ultima_sesion;
GO
CREATE TRIGGER tr_actualizar_ultima_sesion ON usuarios AFTER UPDATE AS
BEGIN
    UPDATE u SET u.ultima_sesion = GETDATE() FROM usuarios u INNER JOIN inserted i ON u.id = i.id;
END;
GO





DROP TRIGGER IF EXISTS tr_marcar_test_completado;
GO
CREATE TRIGGER tr_marcar_test_completado ON resultados_test AFTER INSERT AS
BEGIN
    UPDATE u SET u.test_completado = 1 FROM usuarios u INNER JOIN inserted i ON u.id = i.usuario_id;
END;
GO





DROP TRIGGER IF EXISTS tr_prevenir_borrado_pregunta_usada;
GO
CREATE TRIGGER tr_prevenir_borrado_pregunta_usada ON preguntas_test INSTEAD OF DELETE AS
BEGIN
    IF EXISTS (SELECT 1 FROM deleted d JOIN opciones_respuesta o ON d.id = o.pregunta_id)
    BEGIN
        RAISERROR ('No se puede borrar una pregunta con opciones asociadas. Elimine primero las opciones.', 16, 1);
        ROLLBACK TRANSACTION;
    END
    ELSE
    BEGIN
        DELETE FROM preguntas_test WHERE id IN (SELECT id FROM deleted);
    END;
END;
GO





DROP TRIGGER IF EXISTS tr_prevenir_borrado_DatosP_vinculados;
GO
CREATE TRIGGER tr_prevenir_borrado_DatosP_vinculados ON DatosP INSTEAD OF DELETE AS
BEGIN
    IF EXISTS (SELECT 1 FROM deleted d JOIN usuarios u ON d.id = u.id_datosP)
    BEGIN
        RAISERROR ('Error: no se pueden borrar los datos personales porque están asociados a un usuario activo. Elimine primero el usuario.', 16, 1);
        ROLLBACK TRANSACTION;
    END
    ELSE
    BEGIN
        DELETE FROM DatosP WHERE id IN (SELECT id FROM deleted);
    END;
END;
GO





DROP TRIGGER IF EXISTS tr_eliminar_resultados_al_borrar_usuario;
GO
CREATE TRIGGER tr_eliminar_resultados_al_borrar_usuario ON usuarios AFTER DELETE AS
BEGIN
    DELETE FROM resultados_test WHERE usuario_id IN (SELECT id FROM deleted);
END;
GO


-- ========= SECCIÓN 5: PRUEBAS Y EJECUCIONES =========

-- Ejemplo de creación de un nuevo usuario
EXEC sp_crear_nuevo_usuario
    @nombre_persona = N'Jorgito', @apellidop = N'Mendez', @apellidom = N'Ruiz',
    @telefono = 5530123456, @fecha_nacimiento = '2000-01-01',
    @email_persona = N'jorgito@gmail.com', @contrasena_segura = N'segura123';
GO

-- Ejemplo de consulta de información
EXEC sp_ver_info_usuario @id_de_usuario = 1;
GO

-- Ejemplo de guardado de test
EXEC sp_guardar_test_completado
    @id_usuario_del_test = 1, @respuestas_correctas = 8, @cantidad_total_preguntas = 10,
    @puntuacion_final_con_tiempo = 80, @tiempo_segundos = 120.5;
GO

-- Ejemplo de actualización de sesión
EXEC sp_actualizar_fecha_ultima_sesion @id_usuario_que_entro = 1;
GO

------------------------------------------------------------------------------------
--------------------------fragmentacion---------------------------------------------
------------------------------------------------------------------------------------
------------------------------------------------------------------------------------
--------------------------sucursales------------------------------------------------
------------------------------------------------------------------------------------
-- Sucursales en Monterrey
select * from Sucursales
where id_Ciudad in (
    select id from Ciudades where id_Estado = 1
)

-- Sucursales en Querétaro
select * from Sucursales
where id_Ciudad in (
    select id from Ciudades where id_Estado = 2
)

-- Sucursales en Guadalajara
select * from Sucursales
where id_Ciudad in (
    select id from Ciudades where id_Estado = 3
)


------------------------------------------------------------------------------------
--------------------------Clientes-------------------------------------------------
------------------------------------------------------------------------------------

-- Clientes en Monterrey
select * from Clientes
where id_Sucursal in (
    select id from Sucursales where id_Ciudad in (
        select id from Ciudades where id_Estado = 1
    )
)

-- Clientes en Querétaro
select * from Clientes
where id_Sucursal in (
    select id from Sucursales where id_Ciudad in (
        select id from Ciudades where id_Estado = 2
    )
)


-- Clientes en Guadalajara
select * from Clientes
where id_Sucursal in (
    select id from Sucursales where id_Ciudad in (
        select id from Ciudades where id_Estado = 3
    )
)


------------------------------------------------------------------------------------
--------------------------Empleados-------------------------------------------------
------------------------------------------------------------------------------------

-- Empleados en Monterrey
select * from Empleados
where id_Sucursal in (
    select id FROM Sucursales where id_Ciudad in (
        select id FROM Ciudades where id_Estado = 1
    )
)


-- Empleados en Querétaro
select * from Empleados
where id_Sucursal in (
    select id from Sucursales where id_Ciudad in (
        select id from Ciudades where id_Estado = 2
    )
)

-- Empleados en Guadalajara
select * from Empleados
where id_Sucursal in (
    select id from Sucursales where id_Ciudad in (
        select id from Ciudades where id_Estado = 3
    )
)

------------------------------------------------------------------------------------
--------------------------Usuarios(Problema)----------------------------------------
------------------------------------------------------------------------------------

select * from Usuarios
where id_datosP in (
	select id from DatosP where id in (
		select id_usuario from Clientes where id_Sucursal in (
			select id from Sucursales where id_Ciudad in (
				select id from Ciudades where id_Estado = 3
			)
		)
	)
)
------------------------------------------------------------------------------------
-------------------------Estados----------------------------------------------------
------------------------------------------------------------------------------------

-- Fragmento: Estados del norte
select * from Estados where id = 1 

-- Fragmento: Estados del centro
select * from Estados where id = 2

-- Fragmento: Estados del occidente
select * from Estados where id = 3

------------------------------------------------------------------------------------
----------------------------------resultados_test----------------------------------
-----------------------------------------------------------------------------------

select * from resultados_test
where usuario_id in (
    select id from usuarios
    where id_datosP in (
        select id from DatosP where id in (
            select id_usuario from Clientes where id_Sucursal in (
                select id from Sucursales where id_Ciudad in (
                    select id from Ciudades where id_Estado = 3
                )
            )
        )
    )
)


INSERT INTO resultados_test (usuario_id, puntuacion, total_preguntas, puntuacion_total, tiempo_resolucion_segundos) VALUES
(1, 8, 10, 80, 120.50),
(2, 7, 10, 70, 130.25),
(3, 9, 10, 90, 110.75),
(4, 6, 10, 60, 140.00),
(5, 10, 10, 100, 105.30),
(6, 7, 10, 70, 125.00),
(7, 8, 10, 80, 115.90),
(8, 5, 10, 50, 150.10),
(9, 9, 10, 90, 100.00),
(10, 6, 10, 60, 135.45)