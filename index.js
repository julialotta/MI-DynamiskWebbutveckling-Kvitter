require("dotenv").config();
require("./mongoose");

const express = require("express");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const KvitterModel = require("./models/KvitterModel");

const usersRouter = require("./routes/users-router.js");
const kvittraRouter = require("./routes/kvittra-routes.js");
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
                return (
                    date.toLocaleDateString() +
                    " - " +
                    date.toLocaleTimeString()
                );
            },
        },
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

// GET homepage (if loggedIn)
app.get("/", async (req, res) => {
    const kvitter = await KvitterModel.find().populate("writtenBy").lean();
    const users = await UsersModel.find().lean();
    // console.log(users);
    res.render("home", {
        kvitter,
        users,
    });
});

//Routers
app.use("/kvittra", kvittraRouter);
app.use("/users", usersRouter);

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
