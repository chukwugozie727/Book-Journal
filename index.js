const session = require("express-session")
const passport = require('passport');
const express = require("express");
const bookRoutes = require("./routes/bookRoute");
const authroutes = require("./routes/authRoute");
require("dotenv").config();
require("./config/passport") // initialize strategy

const app = express();
const port = process.env.PORT || 3000;


app.use(express.urlencoded({ extended: true }));

app.use(
  session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
  secure: false
  },
  })
)

// passport init
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", "./views");

app.use((req, res, next) => {
  res.locals.user = req.user; // makes user available in all EJS views
  next();
});

app.use(express.static("public"));

// Routes
app.use("/", bookRoutes);
app.use("/", authroutes);

app.listen(port, () => {
  console.log(` Server running on port: ${port}`);
});
