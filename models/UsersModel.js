const { Schema, model } = require("mongoose");

const usersSchema = new Schema({
  username: String,
  hashedPassword: String,
  slogan: String,
  googleId: String,
  displayName: String,
});

const UsersModel = model("Users", usersSchema);

module.exports = UsersModel;
