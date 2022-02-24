require("dotenv").config();
const express = require("express");
const exphbs = require("express-handlebars");

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

app.listen(8000, () => {
  console.log("http://localhost:8000");
});
