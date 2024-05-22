const express = require('express')
const router = express.Router()
const messagesController = require('../controllers/messages')

router.get('/:symbol', messagesController.getMessages)
router.post('/:symbol', messagesController.postMessage)
router.delete('/:id', messagesController.deleteMessage)

module.exports = router
