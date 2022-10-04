const Event = require("../models/event");

module.exports = {
  getAllEvents: async (req, res) => {
    // console.log(req.user)
    try {
      const events = await Event.find({ userId: req.user.id });
      res.render("events.ejs", { events: events, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getEventsByID: async (req, res) => {
    const id = req.params.id;
    try {
      const eventsByID = await Event.findById(id);
      res.json(eventsByID);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  createEvent: async (req, res) => {
    // const { eventTitle, eventDescription, startTime, endTime} = req.body;
    // if (!eventTitle || !eventDescription || !startTime || !endTime)
    // return res.status(400).json({ message: "Invalid Data" });
    try {
      await Event.create({
        eventTitle: req.body.eventTitle,
        eventDescription: req.body.eventDescription,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        userId: req.user.id,
      });
      req.flash("success", "Event added");
      res.redirect("/events");
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  deleteEventByID: async (req, res) => {
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
