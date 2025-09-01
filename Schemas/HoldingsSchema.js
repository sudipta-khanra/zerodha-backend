const { Schema } = require("mongoose");

const HoldingsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // link to user
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  avg: { type: Number, required: true },
  price: { type: Number, required: true },
  net: { type: String },
  day: { type: String },
  createdAt: { type: Date, default: new Date() },
});

module.exports = { HoldingsSchema };
