const { DB } = process.env

if (!DB) {
  throw new Error('DB environment variable is required')
}

const Sequelize = require('sequelize')
const db = new Sequelize({
  dialect: 'sqlite',
  storage: DB,
  logging: (...msg) => console.log(msg)
})
module.exports = db
