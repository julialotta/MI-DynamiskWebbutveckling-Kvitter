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

  console.log(newFavorite);
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

module.exports = router;
