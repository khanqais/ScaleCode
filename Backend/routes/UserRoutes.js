const express = require('express')
const {
  syncUser,
  getUserStats
} = require('../controllers/userController.js')
const { requireAuth } = require('../auth/middle.js')

const router = express.Router()


router.use(requireAuth)

router.post('/sync', syncUser)
router.get('/stats', getUserStats)

module.exports = router
