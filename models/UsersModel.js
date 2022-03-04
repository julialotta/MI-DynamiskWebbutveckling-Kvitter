const { Schema, model } = require("mongoose");

const usersSchema = new Schema({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  slogan: String,
  favorites: [{ type: Schema.Types.ObjectId, ref: "Posts" }],
});

const UsersModel = model("Users", usersSchema);

module.exports = UsersModel;
