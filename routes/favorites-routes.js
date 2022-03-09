const KvitterModel = require("../models/KvitterModel");
const FavoritesModel = require("../models/FavoritesModel");
const UsersModel = require("../models/UsersModel");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const utils = require("../utils.js");
const { ObjectId } = require("mongodb");

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

router.get("/:id", async (req, res) => {
  const { token } = req.cookies;
  const tokenData = jwt.decode(token, process.env.JWTSECRET);

  const posts = await KvitterModel.find().populate("writtenBy").lean();

  const favorites = await FavoritesModel.find().lean();
  res.render("users/favorites", { favorites, posts });
});

// Add new favorite
router.post("/add", async (req, res) => {
  const { token } = req.cookies;
  const tokenData = jwt.decode(token, process.env.JWTSECRET);

  const newFavorite = new FavoritesModel({
    description: req.body.description,
    user: tokenData.userId,
    post: req.body.postId,
  });

  if (utils.validateFavorite(newFavorite)) {
    await newFavorite.save();
    res.redirect("/users/profile/" + tokenData.userId);
  } else {
    res.render("users/profile", {
      error:
        "Du måste både välja ett kvitter-inlägg och berätta varför du gillar den",
    });
  }
});

router.get("/delete/:id", async (req, res, next) => {
  const id = getId(req.params.id, next);

  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
  }
  if (id) {
    const favorites = await FavoritesModel.find({
      user: res.locals.userId,
    })
      .populate("user")
      .populate("post")
      .lean();
    //console.log(posts);
    res.render("users/favorites/delete-favorites", { favorites });
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
    const favorites = await FavoritesModel.find({
      user: res.locals.userId,
    })
      .populate("user")
      .populate("post")
      .deleteOne()
      .lean();

    //console.log(posts);
    res.redirect("/");
  } else {
    res.redirect("/unauthorized");
  }
});

// GET EDIT FAVORITE
router.get("/edit/:id", async (req, res, next) => {
  const id = getId(req.params.id, next);

  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
  }
  if (id) {
    const favorites = await FavoritesModel.find({
      user: res.locals.userId,
    })
      .populate("user")
      .populate("post")
      .lean();
    //console.log(posts);
    res.render("users/favorites/edit-favorites", { favorites });
  } else {
    res.redirect("/unauthorized");
  }
});

// POST EDIT SINGLE KVITTER-POST
router.post("/edit/:id", async (req, res, next) => {
  const id = getId(req.params.id, next);

  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
  }
  if (id) {
    const updatedPost = req.body;
    if (utils.validatePost(updatedPost)) {
      await KvitterModel.findById(req.params.id).updateOne(updatedPost);
      res.redirect("/");
    } else {
      const kvitter = await KvitterModel.find().populate("writtenBy").lean();
      const users = await UsersModel.find().lean();
      res.render("home", {
        error: "Your post wasn't updated, you have to write something in it",
        kvitter,
        users,
      });
    }
  } else {
    res.redirect("/unauthorized");
  }
});

module.exports = router;
