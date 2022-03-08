const { Schema, model } = require("mongoose");

const thirdpartSchema = new Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  slogan: String,
  favorites: [{ type: Schema.Types.ObjectId, ref: "Posts" }],
});

const ThirdPartModel = model("thirdpart", thirdpartSchema);

module.exports = ThirdPartModel;
