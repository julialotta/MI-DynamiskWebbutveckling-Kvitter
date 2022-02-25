const express = require("express");
const db = require("../database.js");
const utils = require("../utils.js");
const { ObjectId } = require("mongodb");

const router = express.Router();

// Test for profile
router.get("/", async (req, res) => {
  res.render("profile.hbs");
});

module.exports = router;
