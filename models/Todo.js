const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
  todo: {
    type: String,
    required: true,
  },
  todoDescription: {
    type: String,
    required: true,
  },
  priority:{
    type: String,
    required: true,
  },
  // listType:{
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  // },
  completed: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
})

module.exports = mongoose.model('Todo', TodoSchema)


