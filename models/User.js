const mongoose = require("mongoose");

const user = new mongoose.Schema({
  email: {
    type: String,
  },
  name: {
    type: String,
    default: null,
  },
  isStudent: {
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
    default: null,
  },
  createdBatches: [],
  enrolledBatches: [],
});

module.exports = User = mongoose.model("user", user);
