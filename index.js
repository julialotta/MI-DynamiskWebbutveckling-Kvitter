require("dotenv").config();
require("./mongoose");

const express = require("express");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const utils = require("./utils.js");
const UsersModel = require("./models/UsersModel.js");

const usersRouter = require("./routes/users-router.js");
const app = express();

app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
  })
);

app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.use((req, res, next) => {
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

app.get("/", async (req, res) => {
  res.render("home");
});

app.use("/users", usersRouter);

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
