require("dotenv").config();
const express = require("express");
const exphbs = require("express-handlebars");
const kvittraRouter = require("./routes/kvittra-routes.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
  })
);

app.set("view engine", "hbs");

app.get("/", async (req, res) => {
  res.render("home");
});

app.use("/kvittra", kvittraRouter);

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
