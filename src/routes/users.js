const express = require('express')
const router = express.Router()
const users = require('../controllers/users.js')

router.get('', users.verifyAdminToken, users.getUsers)
router.get('/:email', users.verifyAdminToken, users.getUser)
router.post('', users.verifyAdminToken, users.newUser)
router.put('/:email', users.verifyToken, users.updateUser)
router.delete('/:email', users.verifyToken, users.deleteUser)
router.get('/:email/messages', users.verifyToken, users.getUserMessages)

module.exports = router
