require("dotenv").config();
require("./mongoose");
require("./passport.js");

const express = require("express");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const KvitterModel = require("./models/KvitterModel");
const UsersModel = require("./models/UsersModel");

const usersRouter = require("./routes/users-routes.js");
const kvittraRouter = require("./routes/kvittra-routes.js");
const { ObjectId } = require("mongodb");
const favoritesRouter = require("./routes/favorites-routes.js");

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
      iconFunction: (writtenBy, userId) => {
        // console.log({ writtenBy, userId });

        if (writtenBy.toString() == userId) {
          return "showIcons";
        } else {
          return "hideIcons";
        }
      },
      myPost: (writtenBy, userId) => {
        if (writtenBy.toString() == userId) {
          return "myBorder";
        } else {
          return "notMyBorder";
        }
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
    res.locals.displayName = tokenData.displayName;
    res.locals.userId = tokenData.userId;
    // ANNARS
  } else {
    res.locals.loggedIn = false;
  }
  next();
});

// GET homepage (if loggedIn)
app.get("/", async (req, res) => {
  const kvitter = await KvitterModel.find().populate("writtenBy").lean();
  const users = await UsersModel.find().lean();

  const { token } = req.cookies;
  const tokenData = jwt.decode(token, process.env.JWTSECRET);

  if (tokenData) {
    const userId = tokenData.userId;
    const getPosts = await KvitterModel.find();
    const getAuthor = getPosts.writtenBy;

    res.render("home", {
      kvitter,
      users,
      userId,
      getAuthor,
    });
  } else {
    res.render("home", {
      kvitter,
      users,
      // userId,
      // getAuthor,
    });
  }
});

//Routers
app.use("/kvittra", kvittraRouter);
app.use("/users", usersRouter);
app.use("/favorites", favoritesRouter);

//Thirdpart Login
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
    UsersModel.findOne({ googleId }, async (err, user) => {
      const userData = { displayName: req.user.displayName };
      if (user) {
        userData.userId = user._id;
      } else {
        const newUser = new UsersModel({
          googleId,
          displayName: req.user.displayName,
        });
        const result = await newUser.save();
        userData.userId = result._id;
      }
      const accessToken = jwt.sign(userData, process.env.JWTSECRET);

      res.cookie("token", accessToken);
      res.redirect("/");
    });
  }
);

app.get("/test", async (req, res) => {
  async function showIcons() {
    const { token } = req.cookies;
    const tokenData = jwt.decode(token, process.env.JWTSECRET);

    const getAuthor = await KvitterModel.find({
      writtenBy: tokenData.userId,
    });

    getAuthor.forEach((item) => {
      const id = item.writtenBy;
      console.log(id);
      if (item.writtenBy == tokenData.userId) {
        console.log("true");
        return true;
      } else {
        console.log("false");
        return false;
      }
    });
  }
  showIcons();
});

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
