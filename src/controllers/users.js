const status = require('http-status')
const userModel = require('../models/users.js')
const has = require('has-keys')
const CodeError = require('../util/CodeError.js')
const bcrypt = require('bcrypt')
const jws = require('jws')
const messages = require('../models/messages')
const { ACCESS_TOKEN_SECRET } = process.env

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET environment variable is required')
}

function validPassword (password) {
  return /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(password)
}

async function verifyToken (req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(403).json({ error: 'No token provided' })
  }

  // Split the 'Bearer' prefix from the token
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(403).json({ error: 'Invalid token format' })
  }
  const token = parts[1]

  try {
    const isValid = jws.verify(token, 'HS256', ACCESS_TOKEN_SECRET)
    if (!isValid) {
      return res.status(403).json({ error: 'Invalid token' })
    }

    const decoded = jws.decode(token)
    const user = await userModel.findOne({ where: { email: decoded.payload } })
    if (!user) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

async function verifyAdminToken (req, res, next) {
  await verifyToken(req, res, function () {
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }
    next()
  })
}

async function login (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Endpoint for user login'

  /* #swagger.path = '/users/login' */
  /* #swagger.method = 'post' */
  /* #swagger.parameters['User Login'] = {
      in: 'body',
      description: 'Login credentials.',
      required: true,
      type: 'object',
      schema: {
        type: 'object',
        properties: {
            email: {
                type: 'string',
                description: 'User email'
            },
            password: {
                type: 'string',
                description: 'User password'
            }
        },
        required: ['email', 'password']
      },
      examples: {
          'application/json': {
              email: 'user@example.com',
              password: 'password123'
          }
      }
  } */
  /* #swagger.responses[200] = {
      description: 'Successful operation',
      schema: {
          type: 'object',
          properties: {
              status: { type: 'boolean', description: 'Status of the operation' },
              message: { type: 'string', description: 'Message about the operation' },
              token: { type: 'string', description: 'Authentication token' },
              name: { type: 'string', description: 'Name of the user' },
              role: { type: 'string', description: 'Role of the user' }
          }
      },
      examples: {
          'application/json': {
              status: true,
              message: 'Login successful',
              token: 'example_token',
              name: 'User',
              role: 'user'
          }
      }
  } */
  if (!has(req.body, ['email', 'password'])) throw new CodeError('You must specify the email and password', status.BAD_REQUEST)
  const { email, password } = req.body
  const user = await userModel.findOne({ where: { email } })
  if (user) {
    if (await bcrypt.compare(password, user.passhash)) {
      const token = jws.sign({ header: { alg: 'HS256' }, payload: email, secret: ACCESS_TOKEN_SECRET })
      res.json({ status: true, message: 'Login/Password ok', token, name: user.name, role: user.role })
      return
    }
  }
  res.status(status.FORBIDDEN).json({ status: false, message: 'Wrong email/password' })
}

async function newUser (req, res) {
  if (!has(req.body, ['name', 'email', 'password'])) throw new CodeError('You must specify the name and email', status.BAD_REQUEST)
  const { name, email, password } = req.body
  if (!validPassword(password)) throw new CodeError('Weak password!', status.BAD_REQUEST)
  await userModel.create({ name, email, passhash: await bcrypt.hash(password, 2) })
  res.json({ status: true, message: 'User Added' })
}

async function getUsers (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Endpoint to get all users'

  /* #swagger.path = '/users' */
  /* #swagger.method = 'get' */
  /* #swagger.responses[200] = {
      description: 'Successful operation',
      schema: {
          type: 'array',
          items: {
              type: 'object',
              properties: {
                  name: { type: 'string', description: 'User name' },
                  email: { type: 'string', description: 'User email' },
                  role: { type: 'string', description: 'User role' }
              }
          }
      }
  } */
  const data = await userModel.findAll({ attributes: ['name', 'email', 'role'] })
  res.json({ status: true, message: 'Returning users', data })
}

async function getUser (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Endpoint to get a specific user'

  /* #swagger.path = '/users/{email}' */
  /* #swagger.method = 'get' */
  /* #swagger.parameters['email'] = {
      in: 'path',
      description: 'Email of the user to retrieve.',
      required: true,
      type: 'string'
  } */
  /* #swagger.responses[200] = {
      description: 'Successful operation',
      schema: {
          type: 'object',
          properties: {
              name: { type: 'string', description: 'User name' },
              email: { type: 'string', description: 'User email' },
              role: { type: 'string', description: 'User role' }
          }
      }
  } */
  /* #swagger.responses[404] = {
      description: 'User not found',
      schema: {
          type: 'object',
          properties: {
              status: { type: 'boolean', description: 'Status of the operation' },
              message: { type: 'string', description: 'Message about the operation' }
          }
      }
  } */
  const decodedEmail = decodeURIComponent(req.params.email)
  const user = await userModel.findOne({ where: { email: decodedEmail } })
  if (user) {
    res.json({ status: true, message: 'Returning user', user })
  } else {
    res.status(404).json({ status: false, message: 'User not found' })
  }
}

async function updateUser (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Endpoint to update a specific user'

  /* #swagger.path = '/users/{email}' */
  /* #swagger.method = 'put' */
  /* #swagger.parameters['email'] = {
      in: 'path',
      description: 'Email of the user to update.',
      required: true,
      type: 'string'
  } */
  /* #swagger.parameters['User'] = {
      in: 'body',
      description: 'Information for the user to update.',
      required: true,
      type: 'object',
      schema: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'User name'
            },
            password: {
                type: 'string',
                description: 'User password'
            },
            role: {
                type: 'string',
                description: 'User role'
            }
        },
        required: ['name', 'password', 'role']
      }
  } */
  /* #swagger.responses[200] = {
      description: 'Successful operation',
      schema: {
          type: 'object',
          properties: {
              status: { type: 'boolean', description: 'Status of the operation' },
              message: { type: 'string', description: 'Message about the operation' }
          }
      }
  } */
  const userModified = {}
  for (const field of ['name', 'password']) {
    if (field in req.body) {
      if (field === 'password') {
        if (req.body.password) {
          if (validPassword(req.body.password) === false) {
            throw new CodeError('Weak password!', status.BAD_REQUEST)
          }
          userModified.passhash = await bcrypt.hash(req.body.password, 2)
        }
      } else if (req.body[field]) {
        userModified[field] = req.body[field]
      }
    }
  }

  if (Object.keys(userModified).length === 0) throw new CodeError('You must specify the name or password', status.BAD_REQUEST)

  const decodedEmail = decodeURIComponent(req.params.email)
  const user = await userModel.findOne({ where: { email: decodedEmail } })

  if (!user) {
    return res.status(404).json({ status: false, message: 'User not found' })
  }

  if (req.user.email !== user.email && req.user.role !== 'admin') {
    return res.status(403).json({ status: false, message: 'Access denied' })
  }

  console.log('User to update:', userModified)
  await userModel.update(userModified, { where: { email: decodedEmail } })

  res.json({ status: true, message: 'User updated' })
}

async function deleteUser (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Endpoint to delete a specific user'

  /* #swagger.path = '/users/{email}' */
  /* #swagger.method = 'delete' */
  /* #swagger.parameters['email'] = {
      in: 'path',
      description: 'Email of the user to delete.',
      required: true,
      type: 'string'
  } */
  /* #swagger.responses[200] = {
      description: 'Successful operation',
      schema: {
          type: 'object',
          properties: {
              status: { type: 'boolean', description: 'Status of the operation' },
              message: { type: 'string', description: 'Message about the operation' }
          }
      }
  } */
  /* #swagger.responses[404] = {
      description: 'User not found',
      schema: {
          type: 'object',
          properties: {
              status: { type: 'boolean', description: 'Status of the operation' },
              message: { type: 'string', description: 'Message about the operation' }
          }
      }
  } */
  if (!('email' in req.params)) throw new CodeError('You must specify the email', status.BAD_REQUEST)
  const decodedEmail = decodeURIComponent(req.params.email)

  const user = await userModel.findOne({ where: { email: decodedEmail } })
  if (!user) {
    return res.status(404).json({ status: false, message: 'User not found' })
  }

  if (req.user.email !== user.email && req.user.role !== 'admin') {
    return res.status(403).json({ status: false, message: 'Access denied' })
  }

  await userModel.destroy({ where: { email: decodedEmail } })
  res.json({ status: true, message: 'User deleted' })
}

async function getUserMessages (req, res) {
  // #swagger.tags = ['Users']
  // #swagger.description = 'Endpoint to get messages of a specific user'

  /* #swagger.path = '/users/{email}/messages' */
  /* #swagger.method = 'get' */
  /* #swagger.parameters['email'] = {
      in: 'path',
      description: 'Email of the user to retrieve messages.',
      required: true,
      type: 'string'
  } */
  /* #swagger.responses[200] = {
      description: 'Successful operation',
      schema: {
          type: 'array',
          items: {
              type: 'object',
              properties: {
                  message: { type: 'string', description: 'User message' },
                  timestamp: { type: 'string', description: 'Message timestamp' }
              }
          }
      }
  } */
  /* #swagger.responses[404] = {
      description: 'User not found',
      schema: {
          type: 'object',
          properties: {
              status: { type: 'boolean', description: 'Status of the operation' },
              message: { type: 'string', description: 'Message about the operation' }
          }
      }
  } */
  if (!('email' in req.params)) throw new CodeError('You must specify the email', status.BAD_REQUEST)
  const decodedEmail = decodeURIComponent(req.params.email)

  const user = await userModel.findOne({ where: { email: decodedEmail } })
  if (!user) {
    return res.status(404).json({ status: false, message: 'User not found' })
  }

  if (req.user.email !== user.email && req.user.role !== 'admin') {
    return res.status(403).json({ status: false, message: 'Access denied' })
  }

  const userMessages = await messages.findAll({ where: { userMail: decodedEmail } })
  res.json({ status: true, message: 'Returning messages', user_messages: userMessages })
}

module.exports = {
  verifyToken,
  verifyAdminToken,
  login,
  newUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserMessages
}
