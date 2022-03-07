require("dotenv").config();
require("./mongoose");
require("./passport.js");

const express = require("express");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const KvitterModel = require("./models/KvitterModel");
const thirdPartModel = require("./models/ThirdpartModel.js");

const usersRouter = require("./routes/users-router.js");
const kvittraRouter = require("./routes/kvittra-routes.js");
//const thirdpartRouter = require("./routes/thirdPart-routes.js");
const UsersModel = require("./models/UsersModel");

const app = express();

app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
      formatDate: (time) => {
        const date = new Date(time);
        return date.toLocaleDateString() + " - " + date.toLocaleTimeString();
      },
    },
  })
);

app.set("view engine", "hbs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
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

app.use((req, res, next) => {
  const { token } = req.cookies;
  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    const tokenData = jwt.decode(token, process.env.JWTSECRET);
    res.locals.googleIn = true;
    res.locals.displayName = tokenData.displayName;
    res.locals.googleId = tokenData.id;
  } else {
    res.locals.googleIn = false;
  }
  next();
});

// GET homepage (if loggedIn)
app.get("/", async (req, res) => {
  const kvitter = await KvitterModel.find().populate("writtenBy").lean();
  const users = await UsersModel.find().lean();
  res.render("home", {
    kvitter,
    users,
  });
});

//Routers
app.use("/kvittra", kvittraRouter);
app.use("/users", usersRouter);
//app.use("/thirdpart", thirdpartRouter);

app.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  async (req, res) => {
    const googleId = req.user.id;
    thirdPartModel.findOne({ googleId }, async (err, user) => {
      const userData = { displayName: req.user.displayName };
      if (user) {
        userData.id = user._id;
      } else {
        const newUser = new thirdPartModel({
          googleId,
          displayName: req.user.displayName,
        });
        const result = await newUser.save();
        userData.id = result._id;
      }
      const accessToken = jwt.sign(userData, process.env.JWTSECRET);

      res.cookie("token", accessToken);
      res.redirect("/");
    });
  }
);

app.use("/unauthorized", (req, res) => {
  res.status(403).render("errors/unauthorized");
});

// Error page for page not found.
app.use("/", (req, res) => {
  res.status(404).render("errors/error-page");
});

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
