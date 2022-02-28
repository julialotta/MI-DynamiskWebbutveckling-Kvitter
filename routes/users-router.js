require("dotenv").config();
require("../mongoose.js");

const express = require("express");
const exphbs = require("express-handlebars");
const router = express.Router();

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const utils = require("../utils.js");
const UsersModel = require("../models/UsersModel.js");

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

      res.sendStatus(200);
    }
  });
});

////////// LOGIN FUNCTIONS //////////////

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  UsersModel.findOne({ username }, (err, user) => {
    if (user && utils.comparePassword(password, user.hashedPassword)) {
      // Login correct
      const userData = { userId: user._id, username };
      const accessToken = jwt.sign(userData, process.env.JWTSECRET);

      res.cookie("token", accessToken);
      res.redirect("/");
    } else {
      res.send("Login failed");
    }
  });
});

const forceAuthorize = (req, res, next) => {
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    // INLOGGADE
    next();
  } else {
    res.sendStatus(401);
  }
};

////////// PROFILE FUNCTIONS //////////////

// forceAuthorize
router.get("/profile", async (req, res) => {
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    res.render("users/profile");
  } else {
    res.sendStatus(401);
  }
});

// forceAuthorize
router.get("/profile/edit", async (req, res) => {
  res.render("users/profile-edit");
});

// forceAuthorize
router.post("/profile/edit", async (req, res) => {
  const profile = {
    username: req.body.username,
    slogan: req.body.slogan,
  };

  res.redirect("/users/profile");
});

router.post("/users/remove", async (req, res) => {
  const result = await collection.deleteOne({ _id: id });

  // const collection = await db.getBooksCollection()
  // const result = await collection.deleteOne({ _id: id })
  res.redirect("/");
});

////////// PROFILE FUNCTIONS //////////////

router.use((req, res, next) => {
  const { token } = req.cookies;

  //OM INLOGGAD
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    const tokenData = jwt.decode(token, process.env.JWTSECRET);
    res.locals.loggedIn = true;
    res.locals.username = tokenData.username;
    res.locals.userId = tokenData.userId;
    // ANNARS
  } else {
    res.locals.loggedIn = false;
  }

  next();
});

////////// LOG OUT //////////////
router.post("/log-out", (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});
////////// LOG-OUT //////////////
module.exports = router;
