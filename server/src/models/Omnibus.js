import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

export const Omnibus = sequelize.define('Omnibus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  placa: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  marca: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  modelo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  capacidad: {
    type: DataTypes.INTEGER,
    defaultValue: 40
  },
  tipo: {
    type: DataTypes.STRING(20),
    defaultValue: 'estandar'
  },
  seguro: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  fecha_venc_seguro: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'fecha_venc_seguro'
  },
  estado: {
    type: DataTypes.STRING(20),
    defaultValue: 'disponible'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'omnibus',
  underscored: true
})

export default Omnibus