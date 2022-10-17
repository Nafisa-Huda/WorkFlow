const Event = require("../models/Event");
const startOfDay = require("date-fns/startOfDay");
const endOfDay = require("date-fns/endOfDay");
const subDays = require("date-fns/subDays");
const addDays = require("date-fns/addDays");

module.exports = {
  getAllEvents: async (req, res) => {
    const localeDateString = new Date().toLocaleDateString(); //converts date to readable format (MM/DD/YYYY)
    const findDate = {
      $gte: startOfDay(new Date(localeDateString)), //greater than start of the day
      $lte: endOfDay(new Date(localeDateString)), //less than end of the day
    }; //finds or gets the current day when loading the events page
    try {
      const events = await Event.find({
        date: findDate,
        // calendar: new Date(localeDateString),
        localeDateString: localeDateString,
        userId: req.user.id,
      }).lean();
      res.render("events.ejs", {
        events: events,
        calendar: new Date(localeDateString),
        user: req.user,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getEachDay: async (req, res) => {
    if (!req.body.date) {
      req.body.date = req.params.date; //ensures correct date is gotten when making request
    }
    const date = new Date(req.body.date.replaceAll("-", "/"));
    const findDate = {
      $gte: startOfDay(date),
      $lte: endOfDay(date),
    };
    try {
      const events = await Event.find({
        date: findDate,
        userId: req.user.id,
      }).lean();
      res.render("events.ejs", {
        events: events,
        user: req.user,
        calendar: date,
      });
      console.log(date);
    } catch (err) {
      console.error(err);
    }
  },
  getPreviousDay: async (req, res) => {
    const date = new Date(req.body.date.replaceAll("-", "/"));
    const previousDay = subDays(date, 1).toISOString().slice(0, 10); //subtract 1 day from curr date, converts date to YYYY-MM-DD format
    try {
      res.redirect(`/events/${previousDay}`);
    } catch (err) {
      console.error(err);
    }
  },
  getNextDay: async (req, res) => {
    const date = new Date(req.body.date.replaceAll("-", "/"));
    const nextDay = addDays(date, 1).toISOString().slice(0, 10); //add 1 day from curr date, converts date to YYYY-MM-DD format
    try {
      res.redirect(`/events/${nextDay}`);
    } catch (err) {
      console.error(err);
    }
  },
  createEvent: async (req, res) => {
    let creationDate = req.body.date.replaceAll("-", "/");
    const getDate = new Date(creationDate).toISOString().slice(0, 10);
    try {
      await Event.create({
        eventTitle: req.body.eventTitle,
        eventDescription: req.body.eventDescription,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        date: creationDate,
        userId: req.user.id,
      });
      req.flash("success", "Event added");
      res.redirect(`/events/${getDate}`);
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  deleteEvent: async (req, res) => {
    const id = req.params.id;
    try {
      await Event.findByIdAndRemove(id);
      console.log("Deleted Event");
      res.redirect("/events");
    } catch (err) {
      console.log(err);
    }
  },
};
