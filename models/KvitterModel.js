const { Schema, model } = require("mongoose");

const kvitterSchema = new Schema({
  content: { type: String, required: true },
  time: { type: Number, default: Date.now },
  writtenBy: { type: Schema.Types.ObjectId, ref: "Users", required: true },
});

const KvitterModel = model("Posts", kvitterSchema);

module.exports = KvitterModel;
