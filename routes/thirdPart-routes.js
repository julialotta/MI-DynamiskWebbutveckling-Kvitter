// require("dotenv").config();
// require("../mongoose.js");
// require("../passport.js");

// const express = require("express");
// const router = express.Router();
// const jwt = require("jsonwebtoken");
// const passport = require("passport");

// const utils = require("../utils.js");
// const thirdPartModel = require("../models/ThirdpartModel.js");

// router.get("/", async (req, res) => {
//   res.render("thirdpart/third-home");
// });

// router.get("/failed", (req, res) => {
//   res.send("Failed");
// });

// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["email", "profile"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "/failed",
//   }),
//   async (req, res) => {
//     const googleId = req.user.id;
//     thirdPartModel.findOne({ googleId }, async (err, user) => {
//       const userData = { displayName: req.user.displayName };
//       if (user) {
//         userData.id = user._id;
//       } else {
//         const newUser = new thirdPartModel({
//           googleId,
//           displayName: req.user.displayName,
//         });
//         const result = await newUser.save();
//         userData.id = result._id;
//       }
//       const accessToken = jwt.sign(userData, process.env.JWTSECRET);

//       res.cookie("token", accessToken);
//       res.redirect("/");
//     });
//   }
// );

// router.get("/logout", (req, res) => {
//   res.cookie("token", "", { maxAge: 0 });
//   res.redirect("/");
// });

// module.exports = router;
