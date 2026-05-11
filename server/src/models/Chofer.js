import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

export const Chofer = sequelize.define('Chofer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'usuario_id'
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  licencia: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  fecha_venc_licencia: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fecha_venc_licencia',
    validate: {
      isDate: true
    }
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'choferes',
  underscored: true,
  hooks: {
    beforeFind: (options) => {
      options.where = { ...options.where, activo: true }
    }
  }
})

export default Chofer