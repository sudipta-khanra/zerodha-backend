const mongoose = require("mongoose");
const { OrdersSchema } = require("../Schemas/OrdersSchema");

// Create the model
const OrdersModel = mongoose.model("Order", OrdersSchema);

module.exports = { OrdersModel };
