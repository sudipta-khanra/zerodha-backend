const { Schema } = require("mongoose");

const PositionsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // link to user
  product: { type: String, required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  avg: { type: Number, required: true },
  price: { type: Number, required: true },
  net: { type: String },
  day: { type: String },
  isLoss: { type: Boolean },
  createdAt: { type: Date, default: new Date() },
});

module.exports = { PositionsSchema };
