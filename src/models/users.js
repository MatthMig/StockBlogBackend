const Sequelize = require('sequelize')
const db = require('./database.js')
const users = db.define('users', {
  name: {
    type: Sequelize.STRING(128),
    unique: true,
    validate: {
      is: /^[a-z0-9\u00C0-\u00FF\-'\s]{1,128}$/i
    }
  },
  email: {
    type: Sequelize.STRING(128),
    unique: true,
    primaryKey: true,
    validate: {
      isEmail: true
    }
  },
  passhash: {
    type: Sequelize.STRING(60),
    validate: {
      is: /^[0-9a-z\\/$.]{60}$/i
    }
  },
  role: {
    type: Sequelize.STRING(20),
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']]
    }
  }
}, { timestamps: false })
module.exports = users
