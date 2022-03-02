const KvitterModel = require("../models/KvitterModel");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

// FOR ERRORS
// let id = undefined;
// try {
//   id = req.params.id;
// } catch {
//   next();
// }
// const { token } = req.cookies;
// if (token && jwt.verify(token, process.env.JWTSECRET)) {
//   if (id) {
//     // logged in
//     res.render("");
//   } else {
//     res.redirect("/unauthorized");
//   }
// }

router.post("/", async (req, res) => {
  const { token } = req.cookies;
  const tokenData = jwt.decode(token, process.env.JWTSECRET);
  const newKvitterpost = new KvitterModel({
    ...req.body,
    userId: tokenData.userId,
  });
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
