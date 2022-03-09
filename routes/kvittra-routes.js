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

// POST NEW KVITTER-POST
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

///////////  RENDER EDIT YOUR POSTS /////////////
router.get("/:id/edit", async (req, res) => {
  const { token } = req.cookies;
  const tokenData = jwt.decode(token, process.env.JWTSECRET);

  const id = req.params.id;
  const getAuthor = await KvitterModel.findOne({ _id: id });
  const kvitterPost = await KvitterModel.findById(req.params.id);

  res.render("posts/edit-post", kvitterPost);

  if (tokenData.userId == getAuthor.writtenBy) {
    res.render("posts/edit-post", kvitterPost);
  } else {
    res.redirect("/unauthorized");
  }
});

////////// EDIT YOUR POST AND POST ///////////////

router.post("/:id/edit", async (req, res, next) => {
  const id = ObjectId(req.params.id);
  const { token } = req.cookies;
  const tokenData = jwt.decode(token, process.env.JWTSECRET); // Get user from cookies

  const getUser = await KvitterModel.findById({ _id: id });

  console.log(tokenData.userId);
  console.log(getUser.writtenBy);

  if (getUser.writtenBy == tokenData.userId) {
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

//////////// DELETE OWN POST //////////

router.get("/:id/delete", async (req, res) => {
  const id = req.params.id;

  const { token } = req.cookies;
  const tokenData = jwt.decode(token, process.env.JWTSECRET);

  const getUser = await KvitterModel.findById({ _id: id });

  if (tokenData.userId == getUser.writtenBy) {
    await KvitterModel.findById(id).deleteOne();

    res.redirect("/");
  } else {
    res.redirect("/unauthorized");
  }
});

module.exports = router;

function hej() {
  console.log("hej");
}
