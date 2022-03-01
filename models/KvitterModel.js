const mongoose = require("mongoose");

const kvitterSchema = new mongoose.Schema({
  content: { type: String, required: true },
  time: { type: Number, default: Date.now },
  userId: { type: String },
});

const KvitterModel = mongoose.model("Posts", kvitterSchema);

module.exports = KvitterModel;
