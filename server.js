//npm install express mongoose ejs dotenv
//npm install --save-dev nodemon

//"start": "nodemon server.js"

//Declare Variables
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDB = require("./config/database");
//const TodoTask = require("./models/TodoTask");
const homeRoutes = require("./routes/home")
const editRoutes = require("./routes/edit")
// const calendarRoutes = require("./routes/calendar")

require('dotenv').config({path: './config/.env'})

connectDB()

//Set Middleware
app.set("view engine", "ejs");
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));

//Set Routes
app.use('/', homeRoutes)
app.use('/edit', editRoutes)
// app.use('/calendar', calendarRoutes)

//Start Server
app.listen(process.env.PORT, ()=>{
    console.log('Server is running, you better catch it!')
}) 