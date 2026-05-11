-- Función para asociar un usuario a un conductor
CREATE OR REPLACE FUNCTION asociar_conductor_a_usuario(
    p_username VARCHAR,
    p_nombre_conductor VARCHAR
)
RETURNS VOID AS $$
DECLARE
    v_usuario_id UUID;
    v_chofer_id UUID;
BEGIN
    -- Obtener ID del usuario
    SELECT id INTO v_usuario_id 
    FROM usuarios 
    WHERE username = p_username;
    
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuario no encontrado: %', p_username;
    END IF;
    
    -- Obtener ID del conductor
    SELECT id INTO v_chofer_id 
    FROM choferes 
    WHERE nombre ILIKE p_nombre_conductor;
    
    IF v_chofer_id IS NULL THEN
        RAISE EXCEPTION 'Conductor no encontrado: %', p_nombre_conductor;
    END IF;
    
    -- Actualizar
    UPDATE choferes 
    SET usuario_id = v_usuario_id 
    WHERE id = v_chofer_id;
    
    RAISE NOTICE 'Conductor % asociado al usuario %', p_nombre_conductor, p_username;
END;
$$ LANGUAGE plpgsql;

-- Uso:
-- SELECT asociar_conductor_a_usuario('conductor1', 'Juan Pérez');