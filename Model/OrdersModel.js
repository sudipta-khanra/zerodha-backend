const { model } = require("mongoose");
const mongoose = require("mongoose");

const { OrdersSchema } = require("../Schemas/OrdersSchema");

const OrdersModel = mongoose.model("order", OrdersSchema);

module.exports = { OrdersModel };
