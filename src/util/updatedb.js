const bcrypt = require('bcrypt')
const userModel = require('../models/users')

async function createInitialAdmin () {
  const adminName = 'Sebastien Viardot'
  const adminEmail = 'Sebastien.Viardot@grenoble-inp.fr'
  const adminPassword = '123456'

  // Check if the admin already exists
  const existingAdmin = await userModel.findOne({ where: { email: adminEmail } })
  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Create the admin
  await userModel.create({
    name: adminName,
    email: adminEmail,
    passhash: hashedPassword,
    role: 'admin'
  })

  console.log('Admin user created')
}

module.exports = createInitialAdmin
