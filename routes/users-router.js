require("dotenv").config();
require("../mongoose.js");

const express = require("express");
const exphbs = require("express-handlebars");
const router = express.Router();

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const utils = require("../utils.js");
const UsersModel = require("../models/UsersModel.js");
const { ObjectId } = require("mongodb");

////////// REGISTER FUNCTIONS //////////

router.get("/register-user", async (req, res) => {
  res.render("users/user-register");
});

router.post("/register", async (req, res) => {
  const { username, password, confirmPassword, secret } = req.body;

  UsersModel.findOne({ username }, async (err, user) => {
    if (user) {
      res.send("Username already exists");
    } else if (password !== confirmPassword) {
      res.send("Passwords don't  match");
    } else {
      const newUser = new UsersModel({
        username,
        hashedPassword: utils.hashPassword(password),
        secret,
      });
      await newUser.save();

      console.log(newUser);

      // res.sendStatus(200);
      res.redirect("/");
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
      res.send("Login failed");
    }
  });
});

////////// PROFILE FUNCTIONS //////////////
router.get("/profile/:id", async (req, res, next) => {
  let id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }

  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    if (id) {
      const user = await UsersModel.findOne({ _id: id });
      res.render("users/profile", user);
    }
  }
});

router.get("/profile/edit/:id", async (req, res, next) => {
  let id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }

  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    if (id) {
      const user = await UsersModel.findOne({ _id: id });
      res.render("users/profile-edit", { user });
    }
  }
});

router.post("/profile/edit/:id", async (req, res, next) => {
  let id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }

  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    if (id) {
      const profile = {
        username: req.body.username,
        slogan: req.body.slogan,
      };

      await UsersModel.findOne({ _id: id }).updateOne(profile);

      res.redirect("/users/profile/" + id);
    }
  }
});

router.post("/profile/remove/:id", async (req, res, next) => {
  id = undefined;
  try {
    id = ObjectId(req.params.id);
  } catch {
    next();
  }
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    if (id) {
      await UsersModel.findOne({ _id: id }).deleteOne();
      res.cookie("token", "", { maxAge: 0 });
      res.redirect("/");
    }
  }
});

/////////// LOG OUT FUNCTIONS /////////

router.post("/log-out", (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});

/////////// LOG OUT FUNCTIONS /////////

module.exports = router;
