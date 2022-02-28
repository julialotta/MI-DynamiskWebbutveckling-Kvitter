const express = require("express");
const KvitterModel = require("../models/KvitterModel");
const router = express.Router();

// desc är lika med descending
// lean gör om objektet till ett jsonobjekt
router.get("/", async (req, res) => {
  const kvitterPosts = await KvitterModel.find()
    .sort([["time", "desc"]])
    .lean();
  res.render("home", { kvitterPosts });
});

/* router.get("/read-article/:id", async (req, res) => {
  const article = await ArticlesModel.findById(req.params.id);
  res.render("single-article", article);
});

router.get("/new-article", (req, res) => {
  res.render("new-article");
}); */

router.post("/new-kvitter", async (req, res) => {
  const newKvitterpost = new KvitterModel(req.body);
  const result = await newKvitterpost.save();
  res.redirect("/" + result.id);
});

router.get("/seed-data", async (req, res) => {
  const newArticle = new ArticlesModel({
    title: "my second post",
    content: "this is my second first post",
  });
  await newArticle.save();
  res.sendStatus(200);
});

module.exports = router;
