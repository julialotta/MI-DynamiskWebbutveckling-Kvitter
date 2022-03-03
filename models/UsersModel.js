const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
    username: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    slogan: String,
    favorites: Array,
});

const UsersModel = mongoose.model("Users", usersSchema);

module.exports = UsersModel;
