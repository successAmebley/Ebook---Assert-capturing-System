// app.js
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const ejs = require("ejs");

const User = require("./models/User");
const login = require("./Auth/login");
const register = require("./Auth/register");
const dashboard = require("./routes/dashboard");
const booking = require("./routes/booking");
const calendar = require("./routes/calendar");
const bookhistory = require("./routes/bookhistory");
const profile = require("./routes/profile");
const pending = require("./routes/pending");
const pcSpecs = require("./routes/pcSpecs");
const printerSpecs = require("./routes/printerSpec");
const hrInventory = require("./routes/hrInventory");
const otherSpecs = require("./routes/otherSpecs");

const app = express();

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/ECG", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
  })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection failed:", err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 }, // 24 hours session timeout
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware to expose flash messages to views
app.use((req, res, next) => {
  res.locals.successMessage = req.flash("successMessage");
  res.locals.errorMessage = req.flash("errorMessage");
  next();
});

// Passport configuration
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });

      if (!user) {
        return done(null, false, { errorMessage: "Incorrect username." });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return done(null, false, { errorMessage: "Incorrect password." });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});


// Routes
app.use("/", login);
app.use("", register);
app.use("", authenticate, dashboard);
app.use("", authenticate, booking);
app.use("", authenticate, calendar);
app.use("", authenticate, bookhistory);
app.use("", authenticate, profile);
app.use("", authenticate, pending);
app.use("", authenticate, pcSpecs); // Require admin role for pcSpecs route
app.use("", authenticate, printerSpecs); // Require admin role for printerSpecs route
app.use("", authenticate, hrInventory); // Require admin role for hrInventory route
app.use("", authenticate, otherSpecs);
app.use("", (req, res) => {
  res.status(404).render('404');
});
 
// Custom middleware for authentication
function authenticate(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

// Custom middleware for admin authorization
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.redirect("/");
}


// Custom middleware to expose flash messages to views
app.use((req, res, next) => {
  res.locals.successMessage = req.flash("successMessage");
  res.locals.errorMessage = req.flash("errorMessage");
  next();
});
// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
