/* Pour info, ce point de départ est une adaptation de celui qui vous obtiendriez
en faisant npm create backend
issu du dépôt
<https://github.com/ChoqueCastroLD/create-backend/tree/master/src/template/js>
*/

require('dotenv').config()
const { PORT } = process.env

if (!PORT) {
  throw new Error('PORT environment variable is required')
}

// Instantiate an Express Application
const app = require('./app')
// Open Server on selected Port
app.listen(
  PORT,
  () => console.info('Server listening on port ', PORT)
)
