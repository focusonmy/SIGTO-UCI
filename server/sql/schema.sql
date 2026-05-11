-- SIGTO UCI - Schema de Base de Datos PostgreSQL
-- Ejecutar este script en pgAdmin4 para crear la base de datos

-- schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE usuarios (
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'conductor')),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE choferes (
CREATE TABLE choferes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE REFERENCES usuarios(id) ON DELETE SET NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) UNIQUE,
    licencia VARCHAR(50) UNIQUE,
    fecha_venc_licencia DATE,
    observacion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE omnibus (
CREATE TABLE omnibus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placa VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    anio INTEGER,
    capacidad INTEGER DEFAULT 40,
    tipo VARCHAR(20) DEFAULT 'estandar' CHECK (tipo IN ('estandar', 'articulado')),
    seguro VARCHAR(100) UNIQUE,
    fecha_venc_seguro DATE,
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'en_servicio', 'mantenimiento')),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rutas (
CREATE TABLE rutas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    origen VARCHAR(100) NOT NULL,
    destino VARCHAR(100) NOT NULL,
    distancia VARCHAR(20),
    duracion_estimada VARCHAR(20),
    puntos_json JSONB DEFAULT '[]',
    observacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE asignacion_ruta (
CREATE TABLE asignacion_ruta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ruta_id UUID REFERENCES rutas(id) ON DELETE CASCADE NOT NULL,
    chofer_id UUID REFERENCES choferes(id) ON DELETE SET NULL,
    omnibus_id UUID REFERENCES omnibus(id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL CHECK (hora IN ('06:45', '17:15')),
    estado VARCHAR(20) DEFAULT 'garantizada' CHECK (estado IN ('garantizada', 'pendiente', 'cancelada')),
    observacion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ruta_id, fecha, hora)
);

CREATE INDEX idx_asignacion_fecha ON asignacion_ruta(fecha);
CREATE INDEX idx_asignacion_chofer ON asignacion_ruta(chofer_id);
CREATE INDEX idx_asignacion_omnibus ON asignacion_ruta(omnibus_id);
CREATE INDEX idx_asignacion_ruta ON asignacion_ruta(ruta_id);
CREATE INDEX idx_asignacion_hora ON asignacion_ruta(hora);
CREATE INDEX idx_choferes_cedula ON choferes(cedula);
CREATE INDEX idx_omnibus_placa ON omnibus(placa);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_choferes_updated_at BEFORE UPDATE ON choferes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_omnibus_updated_at BEFORE UPDATE ON omnibus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rutas_updated_at BEFORE UPDATE ON rutas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asignacion_ruta_updated_at BEFORE UPDATE ON asignacion_ruta FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION asociar_conductor_a_usuario(p_username VARCHAR, p_nombre_chofer VARCHAR)
RETURNS VOID AS $$
DECLARE
    v_usuario_id UUID;
    v_chofer_id UUID;
BEGIN
    SELECT id INTO v_usuario_id FROM usuarios WHERE username = p_username;
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuario % no encontrado', p_username;
    END IF;
    
    SELECT id INTO v_chofer_id FROM choferes WHERE nombre = p_nombre_chofer;
    IF v_chofer_id IS NULL THEN
        RAISE EXCEPTION 'Chofer % no encontrado', p_nombre_chofer;
    END IF;
    
    UPDATE choferes SET usuario_id = v_usuario_id WHERE id = v_chofer_id;
END;
$$ LANGUAGE plpgsql;