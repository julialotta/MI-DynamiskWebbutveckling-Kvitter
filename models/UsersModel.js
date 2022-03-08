const { Schema, model } = require("mongoose");

const usersSchema = new Schema({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  slogan: String,
});

const UsersModel = model("Users", usersSchema);

module.exports = UsersModel;
