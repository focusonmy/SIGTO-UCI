import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

export const AsignacionRuta = sequelize.define('AsignacionRuta', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ruta_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'rutas',
      key: 'id'
    }
  },
  chofer_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'choferes',
      key: 'id'
    }
  },
  omnibus_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'omnibus',
      key: 'id'
    }
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('garantizada', 'pendiente', 'cancelada'),
    defaultValue: 'garantizada'
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'asignacion_ruta',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['ruta_id', 'fecha', 'hora'] },
    { fields: ['fecha'] },
    { fields: ['chofer_id'] },
    { fields: ['omnibus_id'] },
    { fields: ['ruta_id'] }
  ]
})