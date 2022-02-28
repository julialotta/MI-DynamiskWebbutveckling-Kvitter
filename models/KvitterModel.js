const mongoose = require("mongoose");

const kvitterSchema = new mongoose.Schema({
  kvitterPost: { type: String, required: true },
  time: { type: Number, default: Date.now },
  content: String,
});

const KvitterModel = mongoose.model("Posts", kvitterSchema);

module.exports = KvitterModel;
