const KvitterModel = require("../models/KvitterModel");
const UsersModel = require("../models/UsersModel");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const utils = require("../utils");

// ID FUNCTION \\
function getId(id, next) {
  let parsedid = undefined;

  try {
    parsedid = ObjectId(id);
  } catch {
    next();
  }

  return parsedid;
}

router.post("/", async (req, res) => {
  const { token } = req.cookies;
  const tokenData = jwt.decode(token, process.env.JWTSECRET);
  const newKvitterpost = new KvitterModel({
    ...req.body,
    writtenBy: tokenData.userId,
  });
  if (utils.validatePost(newKvitterpost)) {
    await newKvitterpost.save();
    res.redirect("/");
  } else {
    const kvitter = await KvitterModel.find().populate("writtenBy").lean();
    const users = await UsersModel.find().lean();
    res.render("home", {
      kvitter,
      users,
      error: "You have to write something",
    });
  }
});

router.get("/read-kvitter/:id", async (req, res, next) => {
  const id = getId(req.params.id, next);

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
  const id = getId(req.params.id, next);

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
  const id = getId(req.params.id, next);

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
  const id = getId(req.params.id, next);

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
  const id = getId(req.params.id, next);

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
