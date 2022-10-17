const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  eventTitle: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: false,
  },
  endTime: {
    type: String,
    required: false,
  },
  eventDescription: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  date: {
    type: Date, 
    default: Date.now
  },
});
module.exports = mongoose.model("Event", EventSchema);
