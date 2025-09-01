const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // link to user
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  mode: { type: String, required: true }, // BUY or SELL
  createdAt: { type: Date, default: new Date() },
});

module.exports = { OrdersSchema };
