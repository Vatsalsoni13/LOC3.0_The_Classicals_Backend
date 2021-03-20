const mongoose = require("mongoose");

const batch = new mongoose.Schema({
  userId: {
    type: String, // the one who created this batch
  },
  info: {
    title: {
      type: String,
      require: true,
    },
    std: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    subject: {
      type: String,
      require: true,
    },
    date_of_begin: {
      type: Date,
      default: Date.now,
    },
  },
  students: [],
  assigned: [],
  lectures: [], //startTime,endTime,Name,description(optional),meetLink
});

module.exports = Batch = mongoose.model("batch", batch);
