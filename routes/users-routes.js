require("dotenv").config();
require("../mongoose.js");
require("../passport.js");

const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const utils = require("../utils.js");
const UsersModel = require("../models/UsersModel.js");
const KvitterModel = require("../models/KvitterModel.js");
const { ObjectId } = require("mongodb");
const FavoritesModel = require("../models/FavoritesModel.js");

// Id function \\
function getId(id, next) {
  let parsedid = undefined;

  try {
    parsedid = ObjectId(id);
  } catch {
    next();
  }
  return parsedid;
}

////////// REGISTER FUNCTIONS //////////
router.get("/register-user", async (req, res) => {
  res.render("users/user-register");
});

router.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  UsersModel.findOne({ username }, async (err, user) => {
    if (user) {
      res.render("users/user-register", {
        error: "Username already exists",
      });
    } else if (password.length <= 4) {
      res.render("users/user-register", {
        error: "Your password must have at least 5 characters",
      });
    } else if (password !== confirmPassword) {
      res.render("users/user-register", {
        error: "Passwords don't match",
      });
    } else {
      const newUser = new UsersModel({
        username,
        hashedPassword: utils.hashPassword(password),
      });
      if (utils.validateUsername(newUser)) {
        await newUser.save();

        UsersModel.findOne({ username }, (err, user) => {
          const userData = { userId: user._id, username };
          const accessToken = jwt.sign(userData, process.env.JWTSECRET);

          res.cookie("token", accessToken);
          res.redirect("/");
        });
      } else {
        res.render("users/user-register", {
          error: "You have to enter some data",
        });
      }
    }
  });
});

////////// LOGIN FUNCTIONS //////////////
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  UsersModel.findOne({ username }, (err, user) => {
    if (user && utils.comparePassword(password, user.hashedPassword)) {
      // Logged in
      const userData = { userId: user._id, username };
      const accessToken = jwt.sign(userData, process.env.JWTSECRET);

      res.cookie("token", accessToken);
      res.redirect("/");
    } else {
      // Login incorrect
      res.render("home", {
        error: "Login failed",
      });
    }
  });
});

// THIRD PARTY PROFILE FUNCTIONS \\

////////// PROFILE FUNCTIONS //////////////
// GET, PROFILE/:ID \\
router.get("/profile/:id", async (req, res, next) => {
  const id = getId(req.params.id, next);

  // if user is logged in.
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    if (id) {
      const user = await UsersModel.findOne({ _id: id }).lean();

      const favorites = await FavoritesModel.find({ user: id })
        .populate("user")
        .populate("post")
        .lean();

      res.render("users/profile", { user, favorites });
    }
  }
});

// GET, PROFILE/EDIT/:ID \\
router.get("/profile/edit/:id", async (req, res, next) => {
  const id = getId(req.params.id, next);

  // if user is logged in.
  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    if (id) {
      const user = await UsersModel.findOne({ _id: id });
      res.render("users/profile-edit", user);
    }
    // if user is not logged in.
  } else {
    res.redirect("/unauthorized");
  }
});

// POST, PROFILE/EDIT/:ID \\
router.post("/profile/edit/:id", async (req, res, next) => {
  const id = getId(req.params.id, next);

  const user = await UsersModel.findById(req.params.id);

  user.username = req.body.username;
  user.displayName = req.body.displayName;
  user.slogan = req.body.slogan;
  if (id) {
    if (utils.validateUsername(user)) {
      await user.save();
      const userData = {
        userId: id,
        username: req.body.username,
        displayName: req.body.displayName,
      };
      const accessToken = jwt.sign(userData, process.env.JWTSECRET);
      res.cookie("token", accessToken);
      res.redirect("/users/profile/" + id);
    } else {
      const kvitter = await KvitterModel.find().populate("writtenBy").lean();
      const users = await UsersModel.find().lean();
      res.render("home", {
        error:
          "Your username wasn't updated, you have to have at least one character",
        kvitter,
        users,
      });
    }
  } else {
    res.redirect("/unauthorized");
  }
});

// POST, PROFILE/REMOVE/:ID \\
router.post("/profile/remove/:id", async (req, res, next) => {
  const id = getId(req.params.id, next);

  // if user is logged in.
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    if (id) {
      await UsersModel.findOne({ _id: id }).deleteOne();
      res.cookie("token", "", { maxAge: 0 });
      res.redirect("/");
    }
    // if user is not logged in.
  } else {
    res.redirect("/unauthorized");
  }
});

/////////// LOG OUT FUNCTIONS /////////
router.post("/log-out", (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});

/////////// LIKE FUNCTIONS /////////
router.get("/:id/like", async (req, res) => {
  const { token } = req.cookies;
  const tokenData = jwt.decode(token, process.env.JWTSECRET);

  const user = await UsersModel.findById(tokenData.userId);
  user.favorites.push(ObjectId(req.params.id));

  await user.save();

  res.redirect("/");
});

/////////// FORGOT YOUR PASSWORD? /////////
router.get("/forgot", (req, res) => {
  res.render("users/forgot");
});

///////// DELETE USER  AND USERS POSTS///////////

router.get("/delete/:id", async (req, res) => {
  const id = ObjectId(req.params.id); // get user-id from url

  const { token } = req.cookies;
  const tokenData = jwt.decode(token, process.env.JWTSECRET);

  if (tokenData.userId == id) {
    await UsersModel.findById({ _id: id }).deleteOne(id);

    await KvitterModel.find({ writtenBy: id }).deleteMany();

    res.cookie("token", "", { maxAge: 0 });

    res.redirect("/");
  } else {
    res.redirect("/unauthorized");
  }
});

module.exports = router;
