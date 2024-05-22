const Sequelize = require('sequelize')
const db = require('./database')

const Message = db.define('message', {
  symbol: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  userMail: {
    type: Sequelize.STRING,
    allowNull: false
  }
})

module.exports = Message
