const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },

  creators: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
