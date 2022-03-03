const KvitterModel = require("../models/KvitterModel");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

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

router.get("/read-kvitter/:id", async (req, res, next) => {
  let id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }

  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    if (id) {
      const kvitterPost = await KvitterModel.findById(req.params.id);
      res.render("posts/single-post", kvitterPost);
    }
  } else {
    res.redirect("/unauthorized");
  }
});

router.get("/edit/:id", async (req, res, next) => {
  let id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }

  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
  }
  if (id) {
    const kvitterPost = await KvitterModel.findById(req.params.id);
    res.render("posts/edit-post", kvitterPost);
  } else {
    res.redirect("/unauthorized");
  }
});

router.post("/edit/:id", async (req, res, next) => {
  let id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }

  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
  }
  if (id) {
    const updatedPost = req.body;
    await KvitterModel.findById(req.params.id).updateOne(updatedPost);
    res.redirect("/");
  } else {
    res.redirect("/unauthorized");
  }
});

router.get("/delete/:id", async (req, res, next) => {
  let id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }

  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
  }
  if (id) {
    const kvitterPost = await KvitterModel.findById(req.params.id);
    res.render("posts/delete-post", kvitterPost);
  } else {
    res.redirect("/unauthorized");
  }
});

router.post("/delete/:id", async (req, res, next) => {
  let id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }

  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
  }
  if (id) {
    await KvitterModel.findById(req.params.id).deleteOne();
    res.redirect("/");
  } else {
    res.redirect("/unauthorized");
  }
});

module.exports = router;
