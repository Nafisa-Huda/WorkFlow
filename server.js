//Declare Variables
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('express-flash')
const methodOverride = require("method-override");
const logger = require('morgan')
const connectDB = require('./config/database')
const mainRoutes = require("./routes/main");
const todosRoutes = require('./routes/todos')
const eventsRoutes = require("./routes/events");
const pomodoroRoutes = require("./routes/pomodoro");


// const event = require("./models/event");
// const editRoutes = require("./routes/edit");


require('dotenv').config({path: './config/.env'})


// Passport config
require("./config/passport")(passport);

connectDB()

//Set All Middleware
app.set('views', './views');
app.set("view engine", "ejs");
app.use(express.static('public'))
//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Logging
app.use(logger("dev"));
//Use forms for put / delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

//Set Routes
app.use('/', mainRoutes)
app.use('/todos', todosRoutes)
app.use('/events', eventsRoutes)
app.use('/pomodoro', pomodoroRoutes)

//Start Server
app.listen(process.env.PORT, ()=>{
    console.log('Server is running, you better catch it!')
}) 