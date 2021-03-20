const mongoose = require("mongoose");

const lecture= new mongoose.Schema({
  link: {
    type: String,
  },
  name: {
    type: String,
  },
  batchId: {
    type: String,
  },
});

module.exports = Lecture = mongoose.model("lecture", lecture);