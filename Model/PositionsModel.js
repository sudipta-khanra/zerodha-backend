const mongoose = require("mongoose");
const { PositionsSchema } = require("../Schemas/PositionsSchema");

// Use capitalized singular name for model
const PositionsModel = mongoose.model("Position", PositionsSchema);

module.exports = { PositionsModel };
