const express = require('express')
const router = express.Router()
const todosController = require('../controllers/todos') 
const { ensureAuth } = require('../middleware/auth')

router.get('/', ensureAuth, todosController.getTodos)

router.get("/getListType/:id", ensureAuth, todosController.getListType)

router.post('/createTodo', todosController.createTodo)

router.put('/markComplete/:id', todosController.markComplete)

router.put('/markIncomplete/:id', todosController.markIncomplete)

router.delete('/deleteTodo/:id', todosController.deleteTodo)


module.exports = router