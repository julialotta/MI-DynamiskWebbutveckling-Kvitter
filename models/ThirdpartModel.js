const mongoose = require("mongoose");

const thirdpartSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  slogan: String,
});

const ThirdPartModel = mongoose.model("thirdpart", thirdpartSchema);

module.exports = ThirdPartModel;
