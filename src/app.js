// Patches
const { inject, errorHandler } = require('express-custom-error')
inject() // Patch express in order to use async / await syntax
// Require Dependencies
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const helmet = require('helmet')
const logger = require('./util/logger')
const messages = require('./models/messages')
const users = require('./models/users')
const messagesRouter = require('./routes/messages')
const usersRouter = require('./routes/users')
const createInitialAdmin = require('./util/updatedb')

require('./models/associations')

// Instantiate an Express Application
const app = express()

// Create the database table
Promise.all([
  messages.sync(),
  users.sync()
])
  .then(() => {
    console.log('Database & tables created!')

    createInitialAdmin()

    // Set up your routes after the tables are created
    app.use('/messages', messagesRouter)
    app.use('/users', usersRouter)
  })

// Configure Express App Instance
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Configure custom logger middleware
app.use(logger.dev, logger.combined)
app.use(cookieParser())
app.use(cors())
app.use(helmet())

// Frontend code access in static mode
app.use('/frontend', express.static('./src/frontend'))

// Swagger Documentation
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('../swagger_output.json')
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// This middleware adds the json header to every response
app.use('*', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  next()
})

// Assign Routes
app.use('/', require('./routes/router.js'))
// Handle errors
app.use(errorHandler())
// Handle not valid route
app.use('*', (req, res) => {
  res
    .status(404)
    .json({ status: false, message: 'Endpoint Not Found' })
})
module.exports = app
