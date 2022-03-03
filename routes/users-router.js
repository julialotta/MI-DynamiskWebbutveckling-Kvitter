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

// Id function \\
// function getId(id, next) {
//   let parsedid = undefined;

//   try {
//     parsedid = ObjectId(id);
//   } catch {
//     next();
//   }

//   return parsedid;
// }

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
    } else if (password !== confirmPassword) {
      res.send("Passwords don't  match");
    } else {
      const newUser = new UsersModel({
        username,
        hashedPassword: utils.hashPassword(password),
        secret,
      });
      await newUser.save();
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
      res.render("home", {
        error: "Login failed",
      });
    }
  });
});

////////// PROFILE FUNCTIONS //////////////
// GET, PROFILE/:ID \\
router.get("/profile/:id", async (req, res, next) => {
  //const id = utils.getId(req.params.id, next);
  const id = getId(req.params.id, next);

  // if user is logged in.
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    if (id) {
      const user = await UsersModel.findOne({ _id: id });
      res.render("users/profile", user);
    }
    // if user is not logged in.
  } else {
    res.redirect("/unauthorized");
  }
  console.log(id);
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

  // if user is logged in.
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
    // if user is not logged in.
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

/////////// LOG OUT FUNCTIONS /////////

module.exports = router;
