const swaggerAutogen = require('swagger-autogen')()

const outputFile = 'swagger_output.json'
const endpointsFiles = ['src/routes/router.js']

swaggerAutogen(outputFile, endpointsFiles, {
  host: 'stock-blog-backend.osc-fr1.scalingo.io',
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'x-access-token',
      description: 'Token jwt de l utlisateur'
    }
  }
})
