const KvitterModel = require("../models/KvitterModel");
const LikesModel = require("../models/LikesModel");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
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

// POST NEW LIKE
router.get("/:id", async (req, res) => {
  const { token } = req.cookies;
  const tokenData = jwt.decode(token, process.env.JWTSECRET);

  const postId = ObjectId(req.params.id);

  LikesModel.findOne(postId, async (err, post) => {
    if (post) {
      // pusha in ny like i likedBy-array
    } else {
      const newLike = new LikesModel({
        post: req.params.id,
        likedBy: tokenData.userId,
      });
      if (newLike) {
        await newLike.save();
        res.redirect("/");
      } else {
        res.render("home", {
          error: "something went wrong",
        });
      }
    }
  });
});

module.exports = router;
