const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
title: {
    type: String,
    required: true
},
eventDescription: {
    type: String,
    required: true
},
date: {
    type: String,
    required: false
},
repeat:{
    type: String,
    required: false
}
})
module.exports = mongoose.model('event',eventSchema,'events');