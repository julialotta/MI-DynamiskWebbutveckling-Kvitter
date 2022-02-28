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
const db = require("../database.js");
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

////////// PROFILE FUNCTIONS //////////////

router.get("/profile", async (req, res) => {
  //const id = ObjectId(req.params.id);
  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    res.render("users/profile");
  } else {
    res.sendStatus(401);
  }
  // }
  // const collection = await db.getDb();
  // UsersModel.collection.findOne({ _id: id }, (err, user) => {
  //   if (user) {
  //     res.render("users/profile", user);
  //   } else {
  //     next();
  //   }
  // });
});

// forceAuthorize
router.get("/profile/edit", async (req, res, next) => {
  const id = ObjectId(req.params.id);

  const collection = await db.getDb();

  UsersModel.collection.findOne({ _id: id }, (err, user) => {
    if (user) {
      res.render("users/profile-edit");
    } else {
      next();
      console.log(user);
    }
  });
});

// forceAuthorize
router.post("/profile/edit", async (req, res, next) => {
  const id = ObjectId(req.params.id);

  if (id) {
    const profile = {
      username: req.body.username,
      slogan: req.body.slogan,
    };

    const collection = await db.getDb();

    UsersModel.collection.updateOne({ _id: id }, { $set: profile });

    res.redirect("/users/profile");
  }

  // const id = ObjectId(req.params.id);
  // const profile = {
  //   username: req.body.username,
  //   slogan: req.body.slogan,
  // };
  // const collection = await db.getDb();
  // await UsersModel.collection.updateOne({ _id: id }, { $set: profile });
  // res.redirect("/users/profile");
});

router.post("/remove", async (req, res) => {
  const collection = await db.getDb();

  const id = ObjectId(req.params.id);

  await UsersModel.collection.deleteOne({ _id: id });

  res.redirect("/");
});

/////////// LOG OUT FUNCTIONS /////////

router.post("/log-out", (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});

/////////// LOG OUT FUNCTIONS /////////

module.exports = router;
