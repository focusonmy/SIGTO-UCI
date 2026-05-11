-- SIGTO UCI - Seed de Base de Datos PostgreSQL
-- Datos de prueba para el sistema de transporte obrero UCI
-- Ejecutar DESPUES de schema.sql

BEGIN;

-- seed.sql

INSERT INTO usuarios (username, password_hash, rol, nombre) VALUES
('admin', '$2b$10$88W7Dk8iFslQvQsJxy5qp.Xi/Pb9J5WyPOAQ8cLR33wopTApo/UOS', 'admin', 'Administrador del Sistema');

INSERT INTO usuarios (username, password_hash, rol, nombre) VALUES
('conductor1', '$2b$10$Yj1wzXNFScBXTiLGrLeS7eGXsR5hG7Yz4P8QFL6CWzsxZbYYpNsKO', 'conductor', 'Juan Pérez Rodríguez'),
('conductor2', '$2b$10$l5GRARL3ygFUPEqaZu8FbObzyt9G5ZOtabZ8bLJYGD1IEfPDqglWe', 'conductor', 'María García López'),
('conductor3', '$2b$10$IWk5ir3hVgV5e5qnF1krFeu3JZjvSF3rx4baEOLE4AF5C6dm.BAFO', 'conductor', 'Carlos Martínez Hernández'),
('conductor4', '$2b$10$WUi0aqKzQsgoveKM9iJG3eMATWgfT1etBWtE5doyv6iePc.hSMQj2', 'conductor', 'Ana Rodríguez Díaz'),
('conductor5', '$2b$10$SG6IYa4NiZP/XrE/yiI6OeGOU/tbh41i7IHmqaxNT6yjw9xlBZZiW', 'conductor', 'Pedro Sánchez Morales'),
('conductor6', '$2b$10$pKokUZYNPyQ67ZWJ594.Q.y8i1mkbxrKVpuNagKTufz/Kdg9dbMV.', 'conductor', 'Laura López Fernández'),
('conductor7', '$2b$10$usvX2QIuAZCa7uX9XPGhAedDEY6b98ydA/LgEEE6xD9MyaMF8IhUa', 'conductor', 'José García Pérez'),
('conductor8', '$2b$10$Es7kL2y.h3tksu7tW1py8e.5GBj2mJU8Sj5vb2RnRLwJpcM0kGBXK', 'conductor', 'Isabel Hernández Rodríguez'),
('conductor9', '$2b$10$VupkoMJbn.C20kDflNw9iewGFE5S/3Hp9zEYY0iVsbzqAhhcXSSrS', 'conductor', 'Miguel Ángel Díaz Morales'),
('conductor10', '$2b$10$awwAqD0qgrqzOcfS8uvweuAVDloAZQ7NdYsU/pYnbPpfXrXb.XBrC', 'conductor', 'Carmen Fernández López'),
('conductor11', '$2b$10$gVbGEcmk4zYaY2g7.1h78easJpQEWZ2H6pVJL7Tg73noyd4JE2Tb.', 'conductor', 'Antonio Morales García'),
('conductor12', '$2b$10$xJcC5.piIzaD1.0prnyYuupy8hfxRXb3qcFX8zopg5CIfEZM6n5Ui', 'conductor', 'Teresa Rodríguez Hernández'),
('conductor13', '$2b$10$/.rBPFtLXwgqFNwnAKNQxeUpjZOWf.mPJ.K7cqH6qjHnZjzO8ad2K', 'conductor', 'Francisco Javier López Pérez'),
('conductor14', '$2b$10$J6WNNyaAF8hDF4LXTqUom.B4N9CKZp6uetCCEP9tmeK4Fz34icNRq', 'conductor', 'Rosa María Hernández Díaz'),
('conductor15', '$2b$10$Qv1aQRwKqpMASbKFMG.N.OYTzSsWdP8DgltIzI5wu75uBe68JwsQi', 'conductor', 'Manuel Alejandro García Morales');

-- Choferes
INSERT INTO choferes (cedula, nombre, telefono, licencia, fecha_venc_licencia) VALUES
('91020112345', 'Juan Pérez Rodríguez', '+53 52001111', 'L-2026-001', '2026-12-31'),
('88051223456', 'María García López', '+53 52002222', 'L-2026-002', '2026-11-30'),
('92081534567', 'Carlos Martínez Hernández', '+53 52003333', 'L-2026-003', '2027-01-15'),
('90102345678', 'Ana Rodríguez Díaz', '+53 52004444', 'L-2026-004', '2026-10-20'),
('87061456789', 'Pedro Sánchez Morales', '+53 52005555', 'L-2026-005', '2027-03-10'),
('93072567890', 'Laura López Fernández', '+53 52006666', 'L-2026-006', '2026-09-05'),
('86041678901', 'José García Pérez', '+53 52007777', 'L-2027-001', '2027-06-30'),
('94052789012', 'Isabel Hernández Rodríguez', '+53 52008888', 'L-2027-002', '2027-04-15'),
('89061890123', 'Miguel Ángel Díaz Morales', '+53 52009999', 'L-2027-003', '2026-08-25'),
('95072901234', 'Carmen Fernández López', '+53 52101111', 'L-2027-004', '2027-02-28'),
('90083012345', 'Antonio Morales García', '+53 52102222', 'L-2027-005', '2027-05-20'),
('96093123456', 'Teresa Rodríguez Hernández', '+53 52103333', 'L-2027-006', '2026-07-15'),
('87011234567', 'Francisco Javier López Pérez', '+53 52104444', 'L-2027-007', '2027-08-10'),
('97121345678', 'Rosa María Hernández Díaz', '+53 52105555', 'L-2028-001', '2028-01-20'),
('88031456789', 'Manuel Alejandro García Morales', '+53 52106666', 'L-2028-002', '2028-03-15');

-- Asociar conductores a usuarios
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor1')
WHERE nombre = 'Juan Pérez Rodríguez';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor2')
WHERE nombre = 'María García López';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor3')
WHERE nombre = 'Carlos Martínez Hernández';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor4')
WHERE nombre = 'Ana Rodríguez Díaz';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor5')
WHERE nombre = 'Pedro Sánchez Morales';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor6')
WHERE nombre = 'Laura López Fernández';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor7')
WHERE nombre = 'José García Pérez';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor8')
WHERE nombre = 'Isabel Hernández Rodríguez';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor9')
WHERE nombre = 'Miguel Ángel Díaz Morales';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor10')
WHERE nombre = 'Carmen Fernández López';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor11')
WHERE nombre = 'Antonio Morales García';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor12')
WHERE nombre = 'Teresa Rodríguez Hernández';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor13')
WHERE nombre = 'Francisco Javier López Pérez';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor14')
WHERE nombre = 'Rosa María Hernández Díaz';
UPDATE choferes SET usuario_id = (SELECT id FROM usuarios WHERE username = 'conductor15')
WHERE nombre = 'Manuel Alejandro García Morales';

-- Omnibus
INSERT INTO omnibus (placa, marca, modelo, anio, capacidad, tipo, seguro, fecha_venc_seguro, estado) VALUES
('A-001', 'Yutong', 'ZK6122H', 2022, 45, 'estandar', 'SEG-YT-001-2026', '2026-12-31', 'disponible'),
('A-002', 'Yutong', 'ZK6119H', 2021, 40, 'estandar', 'SEG-YT-002-2026', '2026-11-15', 'disponible'),
('B-001', 'King Long', 'XMQ6118', 2023, 50, 'articulado', 'SEG-KL-001-2026', '2026-10-20', 'disponible'),
('B-002', 'King Long', 'XMQ6125', 2022, 45, 'estandar', 'SEG-KL-002-2026', '2027-01-30', 'disponible'),
('C-001', 'Higer', 'KLQ6119', 2023, 40, 'estandar', 'SEG-HG-001-2026', '2026-09-05', 'disponible'),
('C-002', 'Higer', 'KLQ6128', 2021, 50, 'articulado', 'SEG-HG-002-2026', '2026-08-15', 'disponible'),
('D-001', 'Zhong Tong', 'LCK6107', 2022, 35, 'estandar', 'SEG-ZT-001-2026', '2027-02-28', 'disponible'),
('D-002', 'Zhong Tong', 'LCK6119', 2024, 45, 'estandar', 'SEG-ZT-002-2026', '2027-04-10', 'en_servicio'),
('E-001', 'Yutong', 'ZK6107H', 2020, 35, 'estandar', 'SEG-YT-003-2026', '2026-07-20', 'mantenimiento'),
('E-002', 'JAC', 'A90', 2023, 40, 'estandar', 'SEG-JAC-001-2026', '2026-12-15', 'disponible');

-- Rutas
INSERT INTO rutas (nombre, origen, destino, distancia, duracion_estimada, puntos_json) VALUES
('UCI - CUJAE', 'Universidad de las Ciencias Informáticas (UCI)', 'Universidad Tecnológica de La Habana (CUJAE)', '8 km', '20 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.980, "lng": -82.395, "nombre": "Rotonda UCI"},
    {"lat": 22.976, "lng": -82.390, "nombre": "Entrada CUJAE"},
    {"lat": 22.970, "lng": -82.385, "nombre": "CUJAE"}
]'),
('UCI - Capdevila', 'Universidad de las Ciencias Informáticas (UCI)', 'Capdevila, Boyeros', '5 km', '15 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.987, "lng": -82.408, "nombre": "Parada Capdevila 1"},
    {"lat": 22.990, "lng": -82.412, "nombre": "Capdevila"}
]'),
('UCI - Vedado', 'Universidad de las Ciencias Informáticas (UCI)', 'Vedado, Plaza de la Revolución', '18 km', '35 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.990, "lng": -82.415, "nombre": "Boyeros"},
    {"lat": 23.000, "lng": -82.430, "nombre": "Zoológico"},
    {"lat": 23.015, "lng": -82.445, "nombre": "Plaza"},
    {"lat": 23.030, "lng": -82.400, "nombre": "Vedado"},
    {"lat": 23.035, "lng": -82.380, "nombre": "La Rampa"}
]'),
('UCI - Miramar', 'Universidad de las Ciencias Informáticas (UCI)', 'Miramar, Playa', '20 km', '40 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.990, "lng": -82.415, "nombre": "Boyeros"},
    {"lat": 23.005, "lng": -82.435, "nombre": "Ave. Rancho Boyeros"},
    {"lat": 23.025, "lng": -82.430, "nombre": "Plaza"},
    {"lat": 23.045, "lng": -82.435, "nombre": "Miramar"},
    {"lat": 23.050, "lng": -82.445, "nombre": "5ta Avenida"}
]'),
('UCI - Playa (Santa Fe)', 'Universidad de las Ciencias Informáticas (UCI)', 'Santa Fe, Playa', '28 km', '50 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 23.000, "lng": -82.430, "nombre": "Zoológico"},
    {"lat": 23.025, "lng": -82.430, "nombre": "Plaza"},
    {"lat": 23.050, "lng": -82.450, "nombre": "Marina Hemingway"},
    {"lat": 23.065, "lng": -82.465, "nombre": "Santa Fe"}
]'),
('UCI - Marianao', 'Universidad de las Ciencias Informáticas (UCI)', 'Marianao', '22 km', '40 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.990, "lng": -82.415, "nombre": "Boyeros"},
    {"lat": 23.005, "lng": -82.445, "nombre": "Ave. Rancho Boyeros"},
    {"lat": 23.020, "lng": -82.460, "nombre": "Marianao"},
    {"lat": 23.025, "lng": -82.470, "nombre": "Pulido"}
]'),
('UCI - La Lisa', 'Universidad de las Ciencias Informáticas (UCI)', 'La Lisa', '24 km', '45 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.990, "lng": -82.415, "nombre": "Boyeros"},
    {"lat": 23.010, "lng": -82.455, "nombre": "Ave. 51"},
    {"lat": 23.025, "lng": -82.475, "nombre": "La Lisa"},
    {"lat": 23.030, "lng": -82.485, "nombre": "Punta Brava"}
]'),
('UCI - Arroyo Naranjo', 'Universidad de las Ciencias Informáticas (UCI)', 'Arroyo Naranjo', '12 km', '25 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.975, "lng": -82.395, "nombre": "Cotorro"},
    {"lat": 22.965, "lng": -82.380, "nombre": "Arroyo Naranjo"},
    {"lat": 22.960, "lng": -82.370, "nombre": "Calzada de Güines"}
]'),
('UCI - Boyeros (Aeropuerto)', 'Universidad de las Ciencias Informáticas (UCI)', 'Aeropuerto Internacional José Martí, Boyeros', '10 km', '20 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.990, "lng": -82.410, "nombre": "Ave. Rancho Boyeros"},
    {"lat": 22.995, "lng": -82.408, "nombre": "Aeropuerto"}
]'),
('UCI - San Miguel del Padrón', 'Universidad de las Ciencias Informáticas (UCI)', 'San Miguel del Padrón', '15 km', '30 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.975, "lng": -82.390, "nombre": "Cotorro"},
    {"lat": 22.970, "lng": -82.365, "nombre": "San Miguel"},
    {"lat": 22.965, "lng": -82.355, "nombre": "Rocafort"}
]'),
('UCI - Cotorro', 'Universidad de las Ciencias Informáticas (UCI)', 'Cotorro', '6 km', '10 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.980, "lng": -82.395, "nombre": "Rotonda UCI"},
    {"lat": 22.975, "lng": -82.390, "nombre": "Cotorro"}
]'),
('UCI - Guanabacoa', 'Universidad de las Ciencias Informáticas (UCI)', 'Guanabacoa', '16 km', '30 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.975, "lng": -82.395, "nombre": "Cotorro"},
    {"lat": 22.965, "lng": -82.355, "nombre": "San Miguel"},
    {"lat": 22.960, "lng": -82.335, "nombre": "Guanabacoa"},
    {"lat": 22.965, "lng": -82.320, "nombre": "Peñalver"}
]'),
('UCI - Regla', 'Universidad de las Ciencias Informáticas (UCI)', 'Regla', '14 km', '28 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.975, "lng": -82.390, "nombre": "Cotorro"},
    {"lat": 22.960, "lng": -82.360, "nombre": "San Miguel"},
    {"lat": 22.950, "lng": -82.340, "nombre": "Regla"},
    {"lat": 22.948, "lng": -82.330, "nombre": "Casablanca"}
]'),
('UCI - Habana Vieja', 'Universidad de las Ciencias Informáticas (UCI)', 'Habana Vieja', '20 km', '40 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.975, "lng": -82.395, "nombre": "Cotorro"},
    {"lat": 22.965, "lng": -82.365, "nombre": "San Miguel"},
    {"lat": 22.955, "lng": -82.345, "nombre": "Regla"},
    {"lat": 23.000, "lng": -82.350, "nombre": "Túnel de La Habana"},
    {"lat": 23.020, "lng": -82.355, "nombre": "Habana Vieja"},
    {"lat": 23.025, "lng": -82.360, "nombre": "Parque Central"}
]'),
('UCI - Centro Habana', 'Universidad de las Ciencias Informáticas (UCI)', 'Centro Habana', '22 km', '42 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.990, "lng": -82.415, "nombre": "Boyeros"},
    {"lat": 23.000, "lng": -82.430, "nombre": "Zoológico"},
    {"lat": 23.015, "lng": -82.445, "nombre": "Plaza"},
    {"lat": 23.025, "lng": -82.375, "nombre": "Colón"},
    {"lat": 23.030, "lng": -82.365, "nombre": "Centro Habana"}
]'),
('UCI - Diez de Octubre', 'Universidad de las Ciencias Informáticas (UCI)', 'Diez de Octubre (Lawton)', '14 km', '28 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.990, "lng": -82.410, "nombre": "Boyeros"},
    {"lat": 22.995, "lng": -82.395, "nombre": "Luyanó"},
    {"lat": 23.000, "lng": -82.380, "nombre": "Lawton"},
    {"lat": 23.005, "lng": -82.370, "nombre": "Diez de Octubre"}
]'),
('UCI - Cerro', 'Universidad de las Ciencias Informáticas (UCI)', 'Cerro', '16 km', '30 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.990, "lng": -82.415, "nombre": "Boyeros"},
    {"lat": 23.000, "lng": -82.430, "nombre": "Zoológico"},
    {"lat": 23.010, "lng": -82.415, "nombre": "Cerro"},
    {"lat": 23.015, "lng": -82.405, "nombre": "Pocito"}
]'),
('UCI - Santiago de las Vegas', 'Universidad de las Ciencias Informáticas (UCI)', 'Santiago de las Vegas, Boyeros', '7 km', '12 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.980, "lng": -82.398, "nombre": "Salida UCI"},
    {"lat": 22.975, "lng": -82.392, "nombre": "Santiago de las Vegas"}
]'),
('UCI - Wajay', 'Universidad de las Ciencias Informáticas (UCI)', 'Wajay, Boyeros', '9 km', '15 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.990, "lng": -82.408, "nombre": "Ave. Rancho Boyeros"},
    {"lat": 22.985, "lng": -82.418, "nombre": "Wajay"},
    {"lat": 22.982, "lng": -82.425, "nombre": "Fontanar"}
]'),
('UCI - Plaza (San Carlos)', 'Universidad de las Ciencias Informáticas (UCI)', 'Plaza de la Revolución (San Carlos)', '17 km', '32 min', '[
    {"lat": 22.985, "lng": -82.402, "nombre": "UCI"},
    {"lat": 22.990, "lng": -82.415, "nombre": "Boyeros"},
    {"lat": 23.000, "lng": -82.430, "nombre": "Zoológico"},
    {"lat": 23.015, "lng": -82.445, "nombre": "Plaza"},
    {"lat": 23.020, "lng": -82.435, "nombre": "San Carlos"}
]');

-- Asignaciones de ejemplo

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE, '06:45', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - CUJAE';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE, '06:45', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Vedado';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE, '06:45', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Miramar';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE, '06:45', 'pendiente'
FROM rutas r WHERE r.nombre = 'UCI - Capdevila';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE, '17:15', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Vedado';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE, '17:15', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Centro Habana';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE, '17:15', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Cerro';

-- Asignaciones para MAÑANA
INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE + 1, '06:45', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - CUJAE';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE + 1, '06:45', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Miramar';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE + 1, '06:45', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Playa (Santa Fe)';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE + 1, '06:45', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Vedado';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE + 1, '06:45', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Boyeros (Aeropuerto)';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE + 1, '06:45', 'pendiente'
FROM rutas r WHERE r.nombre = 'UCI - Wajay';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE + 1, '06:45', 'pendiente'
FROM rutas r WHERE r.nombre = 'UCI - Cotorro';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE + 1, '17:15', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Vedado';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE + 1, '17:15', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Miramar';

INSERT INTO asignacion_ruta (ruta_id, chofer_id, omnibus_id, fecha, hora, estado)
SELECT r.id, (SELECT id FROM choferes ORDER BY RANDOM() LIMIT 1),
       (SELECT id FROM omnibus WHERE estado = 'disponible' ORDER BY RANDOM() LIMIT 1),
       CURRENT_DATE + 1, '17:15', 'garantizada'
FROM rutas r WHERE r.nombre = 'UCI - Centro Habana';

COMMIT;