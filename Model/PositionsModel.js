const { model } = require("mongoose");
const mongoose = require("mongoose");

const {PositionsSchema} = require("../Schemas/PositionsSchema");

const PositionsModel = mongoose.model("position", PositionsSchema);

module.exports = { PositionsModel };
