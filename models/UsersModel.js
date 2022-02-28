const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  secret: String,
});

const UsersModel = mongoose.model("Users", usersSchema);

module.exports = UsersModel;
