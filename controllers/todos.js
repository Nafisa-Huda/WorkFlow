const Todo = require("../models/Todo");

module.exports = {
  getTodos: async (req, res) => {
    console.log(req.user);
    try {
      const todoItems = await Todo.find({ userId: req.user.id });
      const itemsLeft = await Todo.countDocuments({
        userId: req.user.id,
        completed: false,
      });
      const itemsCompleted = await Todo.countDocuments({
        userId: req.user.id,
        completed: true,
      });
      res.render("todos.ejs", {
        todos: todoItems,
        left: itemsLeft,
        completed: itemsCompleted,
        user: req.user,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getListType: async (req, res) => {
    try {
      const listType = await Todo.listType.findById(req.params.id);
      res.render("todos.ejs", { todos: listType, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  createTodo: async (req, res) => {
    try {
      await Todo.create({
        todo: req.body.todoItem,
        todoDescription: req.body.todoDescription,
        dueDate: req.body.dueDate,
        priority: req.body.priority,
        listType: req.params.id,
        completed: false,
        userId: req.user.id,
      });
      console.log("Todo has been added!");
      res.redirect("/todos");
    } catch (err) {
      console.log(err);
    }
  },
  // markComplete: async (req, res) => {
  //   try {
  //     await Todo.findOneAndUpdate(
  //       { _id: req.params.id },
  //       {
  //         completed: true,
  //       }
  //     );
  //     console.log("Marked Complete");
  //     res.redirect(`/todos`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },
  // markIncomplete: async (req, res) => {
  //   try {
  //     await Todo.findOneAndUpdate(
  //       { _id: req.params.id },
  //       {
  //         completed: false,
  //       }
  //     );
  //     console.log("Marked Incomplete");
  //     res.redirect(`/todos`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // },

  edit: async (req, res) => {
    console.log("REq");
    // console.log(req.body.todoIdFromJSFile, 'todo: ', req.body.todoFromJS)
    try {
      await Todo.findOneAndUpdate(
        { _id: req.body.todoIdFromJSFile },
        {
          todo: req.body.todoItemFromJS,
          todoDescription: req.body.todoDescriptionFromJS,
          dueDate: req.body.dueDateFromJS,
          priority: req.body.priorityFromJS,
          listType: req.params.listTypeFromJS,
          completed: false,
        }
      );
      console.log("Item has been edited");
      res.json("Item has been edited");
    } catch (err) {
      console.log(err);
    }
  },
  deleteTodo: async (req, res) => {
    try {
      await Todo.remove({ _id: req.params.id });
      console.log("Deleted Todo");
      res.redirect("/todos");
    } catch (err) {
      console.log(err);
    }
  },
};
