const express = require('express')
const router = express.Router()
const pomodoroController = require('../controllers/pomodoro') 
const { ensureAuth } = require('../middleware/auth')

router.get('/', ensureAuth, pomodoroController.getPomodoro)


module.exports = router