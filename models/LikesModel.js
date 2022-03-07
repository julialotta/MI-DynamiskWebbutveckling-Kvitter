const { Schema, model } = require("mongoose");

const likesSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "Posts" },
  likedBy: [{ type: Schema.Types.ObjectId, ref: "Users" }],
});

const LikesModel = model("Likes", likesSchema);

module.exports = LikesModel;
