const mongoose = require("mongoose");
const { HoldingsSchema } = require("../Schemas/HoldingsSchema");

// Correct way to define model
const HoldingsModel = mongoose.model("holding", HoldingsSchema);

module.exports = { HoldingsModel };
