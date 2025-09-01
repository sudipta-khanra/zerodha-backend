const mongoose = require("mongoose");
const { HoldingsSchema } = require("../Schemas/HoldingsSchema");

// Create the model
const HoldingsModel = mongoose.model("Holding", HoldingsSchema);

module.exports = { HoldingsModel };
