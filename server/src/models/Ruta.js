import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

export const Ruta = sequelize.define('Ruta', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  origen: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  destino: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  distancia: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  duracion_estimada: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'duracion_estimada'
  },
  puntos_json: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'puntos_json'
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'rutas',
  underscored: true
})

export default Ruta