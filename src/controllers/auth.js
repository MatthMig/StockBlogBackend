const User = require('./users')

async function signup (req, res) {
  // #swagger.tags = ['Authentication']
  // #swagger.description = 'Endpoints for user authentication'

  /* #swagger.path = '/signup' */
  /* #swagger.parameters['New User'] = {
      in: 'body',
      description: 'Information for the new user.',
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
            },
            name: {
                type: 'string',
                description: 'User name'
            }
        },
        required: ['email', 'password', 'name']
      },
      examples: {
          'application/json': {
              email: 'newuser@example.com',
              password: 'password123',
              name: 'New User'
          }
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
      },
      examples: {
          'application/json': {
              status: true,
              message: 'User Added'
          }
      }
  } */
  /* #swagger.responses[400] = {
      description: 'Bad Request',
      schema: {
          type: 'object',
          properties: {
              error: { type: 'string', description: 'Error message' }
          }
      }
  } */
  /* #swagger.responses[500] = {
      description: 'Internal Server Error',
      schema: {
          type: 'object',
          properties: {
              error: { type: 'string', description: 'Error message' }
          }
      }
  } */

  /* #swagger.definitions['NewUser'] = {
      type: 'object',
      properties: {
          email: { type: 'string' },
          password: { type: 'string' }
      }
  } */
  try {
    const userResponse = await User.newUser(req, res)
    return res.json(userResponse)
  } catch (err) {
    console.log('Error in POST /signup route:', err)
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'A user with this email already exists.' })
    }
    return res.status(500).json({ error: err.message })
  }
}

async function login (req, res) {
  // #swagger.tags = ['Authentication']
  // #swagger.description = 'Endpoints for user authentication'

  /* #swagger.path = '/login' */
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
      }
  } */
  /* swagger.responses[500] = {
      description: 'Internal Server Error',
      schema: {
          type: 'object',
          properties: {
              error: { type: 'string', description: 'Error message' }
          }
      }
  } */

  /* #swagger.definitions['UserLogin'] = {
      type: 'object',
      properties: {
          email: { type: 'string' },
          password: { type: 'string' }
      }
  } */
  try {
    await User.login(req, res)
  } catch (err) {
    console.log('Error in POST /login route:', err)
    return res.status(500).json({ error: err.message })
  }
}

module.exports = {
  signup,
  login
}
