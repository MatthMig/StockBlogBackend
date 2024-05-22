const users = require('./users')
const messages = require('./messages')

users.hasMany(messages, { foreignKey: 'userMail', sourceKey: 'email' })
messages.belongsTo(users, { foreignKey: 'userMail', targetKey: 'email' })
