const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const kvitterSchema = new mongoose.Schema({
  content: { type: String, required: true },
  time: { type: Number, default: Date.now },
  userId: { type: ObjectId },
});

const KvitterModel = mongoose.model("Posts", kvitterSchema);

module.exports = KvitterModel;
