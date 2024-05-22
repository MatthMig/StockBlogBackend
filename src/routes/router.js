const router = require('express').Router()

router.use('/api/users', require('./users'))
router.use('/api/messages', require('./messages'))
router.use('/api/alpaca', require('./alpaca'))
router.use('/api/auth', require('./auth'))

module.exports = router
