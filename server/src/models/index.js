import { Sequelize } from 'sequelize'
import { Usuario } from './Usuario.js'
import { Chofer } from './Chofer.js'
import { Omnibus } from './Omnibus.js'
import { Ruta } from './Ruta.js'
import { AsignacionRuta } from './AsignacionRuta.js'
import sequelize from '../config/database.js'

// Definir relaciones
// Usuario puede tener un Chofer asociado (relación 1:1)
Usuario.hasOne(Chofer, { foreignKey: 'usuario_id', as: 'chofer', constraints: false })
Chofer.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' })

// Ruta tiene relacion con AsignacionRuta (1:N)
Ruta.hasMany(AsignacionRuta, { foreignKey: 'ruta_id', as: 'asignaciones' })
AsignacionRuta.belongsTo(Ruta, { foreignKey: 'ruta_id', as: 'ruta' })

// AsignacionRuta tiene chofer y omnibus
AsignacionRuta.belongsTo(Chofer, { foreignKey: 'chofer_id', as: 'chofer' })
AsignacionRuta.belongsTo(Omnibus, { foreignKey: 'omnibus_id', as: 'omnibus' })

export {
  sequelize,
  Sequelize,
  Usuario,
  Chofer,
  Omnibus,
  Ruta,
  AsignacionRuta
}

export default {
  sequelize,
  Sequelize,
  Usuario,
  Chofer,
  Omnibus,
  Ruta,
  AsignacionRuta
}