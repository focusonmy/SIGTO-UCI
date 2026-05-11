import { Sequelize } from 'sequelize'

const DB_NAME = process.env.DB_NAME || 'transportu'
const DB_USER = process.env.DB_USERNAME || 'postgres'
const DB_PASS = process.env.DB_PASSWORD || ''
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = parseInt(process.env.DB_PORT) || 5432

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
})

export default sequelize

export async function testConnection() {
  try {
    await sequelize.authenticate()
    return true
  } catch (error) {
    return false
  }
}