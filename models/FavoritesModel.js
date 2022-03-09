const { Schema, model } = require("mongoose");

const FavoritesSchema = new Schema({
  description: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "Users" },
  post: { type: Schema.Types.ObjectId, ref: "Posts" },
});

const FavoritesModel = model("Favorites", FavoritesSchema);

module.exports = FavoritesModel;
