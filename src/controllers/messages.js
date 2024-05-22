const messages = require('../models/messages')
const users = require('../models/users')
const jws = require('jws')

async function fetchMessagesFromDatabase (symbol) {
  const messagesData = await messages.findAll({
    where: {
      symbol: symbol
    },
    include: [{
      model: users,
      attributes: ['name']
    }]
  })
  return messagesData
}

async function getMessages (req, res) {
  // #swagger.tags = ['Messages']
  // #swagger.description = 'Endpoint to get messages for a specific symbol'
  /* #swagger.path = '/:symbol' */
  /* #swagger.parameters['symbol'] = {
        in: 'path',
        description: 'Symbol to fetch messages for.',
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
                    symbol: { type: 'string', description: 'Symbol of the message' },
                    content: { type: 'string', description: 'Content of the message' },
                    userMail: { type: 'string', description: 'Email of the user who posted the message' }
                }
            }
        }
    } */
  /* #swagger.responses[404] = {
        description: 'Messages not found',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'string', description: 'Error message' }
            }
        }
    } */
  const symbol = req.params.symbol
  const messagesData = await fetchMessagesFromDatabase(symbol)
  if (!messagesData) {
    res.status(404).json({ error: 'Messages not found' })
    return
  }
  res.json(messagesData)
}

async function postMessage (req, res) {
  // #swagger.tags = ['Messages']
  // #swagger.description = 'Endpoint to post a new message for a specific symbol'
  /* #swagger.path = '/:symbol' */
  /* #swagger.parameters['New Message'] = {
        in: 'body',
        description: 'Information for the new message.',
        required: true,
        type: 'object',
        schema: {
          type: 'object',
          properties: {
              text: {
                  type: 'string',
                  description: 'Message text'
              }
          },
          required: ['text']
        },
        examples: {
            'application/json': {
                text: 'This is a new message'
            }
        }
    } */
  /* #swagger.responses[200] = {
        description: 'Successful operation',
        schema: {
            type: 'object',
            properties: {
                symbol: { type: 'string', description: 'Symbol of the message' },
                content: { type: 'string', description: 'Content of the message' },
                userMail: { type: 'string', description: 'Email of the user who posted the message' }
            }
        }
    } */
  /* #swagger.responses[400] = {
        description: 'Missing required fields',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'string', description: 'Error message' }
            }
        }
    } */
  /* #swagger.responses[500] = {
        description: 'Error creating message',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'string', description: 'Error message' }
            }
        }
    } */
  const symbol = req.params.symbol
  const message = req.body

  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Token not provided' })
    return
  }

  let decodedToken
  try {
    decodedToken = jws.decode(token)
  } catch (error) {
    console.error('Invalid token')
    return
  }
  const email = decodedToken.payload

  const user = await users.findOne({ where: { email: email } })

  if (!user) {
    res.status(402).json({ error: 'User not found' })
    return
  }

  // Check if the required fields are present
  if (!symbol || !message || !message.text) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  try {
    // Create a new message with the symbol and content
    const newMessage = await messages.create({
      symbol: symbol,
      content: message.text,
      userMail: user.email
      // Add other fields as necessary
    })

    res.json(newMessage)
  } catch (error) {
    console.error('Error creating message:', error)
    res.status(500).json({ error: 'Error creating message' })
  }
}

async function deleteMessage (req, res) {
  // #swagger.tags = ['Messages']
  // #swagger.description = 'Endpoint to delete a message by id'
  /* #swagger.path = '/:id' */
  /* #swagger.parameters['id'] = {
        in: 'path',
        description: 'ID of the message to delete.',
        required: true,
        type: 'integer'
    } */
  /* #swagger.responses[200] = {
        description: 'Successful operation',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', description: 'Status of the operation' }
            }
        }
    } */
  /* #swagger.responses[404] = {
        description: 'Message not found',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'string', description: 'Error message' }
            }
        }
    } */
  /* #swagger.responses[500] = {
        description: 'Error deleting message',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'string', description: 'Error message' }
            }
        }
    } */
  const id = req.params.id

  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Token not provided' })
    return
  }

  let decodedToken
  try {
    decodedToken = jws.decode(token)
  } catch (error) {
    console.error('Invalid token')
    return
  }
  const email = decodedToken.payload

  const user = await users.findOne({ where: { email: email } })

  if (!user) {
    res.status(403).json({ error: 'User not authorized' })
    return
  }

  try {
    const message = await messages.findOne({ where: { id: id } })

    if (!message) {
      res.status(404).json({ error: 'Message not found' })
      return
    }

    await message.destroy()

    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ error: 'Error deleting message' })
  }
}

module.exports = {
  getMessages,
  postMessage,
  deleteMessage
}
