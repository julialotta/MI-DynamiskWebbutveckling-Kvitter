const express = require("express");
const KvitterModel = require("../models/KvitterModel");
const router = express.Router();

router.post("/", async (req, res) => {
  const newKvitterpost = new KvitterModel(req.body);
  await newKvitterpost.save();
  res.redirect("/");
});

router.get("/read-kvitter/:id", async (req, res) => {
  const kvitterPost = await KvitterModel.findById(req.params.id);
  res.render("posts/single-post", kvitterPost);
});

router.get("/edit/:id", async (req, res) => {
  const kvitterPost = await KvitterModel.findById(req.params.id);
  res.render("posts/edit-post", kvitterPost);
});

router.post("/edit/:id", async (req, res) => {
  const updatedPost = req.body;
  await KvitterModel.findById(req.params.id).updateOne(updatedPost);
  res.redirect("/");
});

router.get("/delete/:id", async (req, res) => {
  const kvitterPost = await KvitterModel.findById(req.params.id);
  res.render("posts/delete-post", kvitterPost);
});

router.post("/delete/:id", async (req, res) => {
  await KvitterModel.findById(req.params.id).deleteOne();
  res.redirect("/");
});

module.exports = router;
