const express = require('express')
const router = express.Router()
const eventsController = require('../controllers/events') 
const { ensureAuth } = require('../middleware/auth')

router.get('/', ensureAuth, eventsController.getAllEvents)

router.get("/:date", ensureAuth, eventsController.getEachDay)

router.post('/createEvent',  eventsController.createEvent)

router.post('/previous', eventsController.getPreviousDay)

router.post('/next', eventsController.getNextDay)

router.delete('/deleteEvent/:id', eventsController.deleteEvent)

module.exports = router