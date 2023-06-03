if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate"); //adding ejs-mate pacakage
const Joi = require("joi"); //for server side validation
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
// const helmet = require("helmet");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");

const MongoStore = require("connect-mongo");

const Campground = require("./models/campground");
const Review = require("./models/review"); //error herree
//./ means current directory, and ../ means parent directorys
// Since, the campground folder is in same folder as our app.js, we used ./
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const { propfind } = require("./routes/campgrounds");

const dbUrl = "mongodb://127.0.0.1:27017/yelp-camp";
mongoose.connect(dbUrl);

const app = express();
const db = mongoose.connection;

//read here for on and once vs try and catch
//https://mongoosejs.com/docs/connections.html#error-handling
//Basically, we can use then/catch or the try/catch block with async/await as shown in the 'Error Handling' section there, which should handle any initial connection errors, and then they say that after the initial connection was established, we should listen for error events on the connection (see the code examples in the documentation link above).
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs"); //view engine are used to render web pages
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); //parsing body for app.post
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); //for public directory

// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//   })
// );
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "thisshouldbeabettersecret",
  },
});

store.on("error", (e) => {
  console.log("SESSION STORE ERROR", e);
});
const sessionConfig = {
  store,
  name: "session",
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());
//session use before passport session**
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); //how to store data in session
passport.deserializeUser(User.deserializeUser()); //how to get user out of session

//middleware
//passed under error and success so we will use them
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'huz7923@gmail.com', username: 'huz' })//username defaultly present
//     const newUser = await User.register(user, 'chicken')//password is chicken and saved automatically
//     //passport do not use bcypt
//     //auto salt and other hashing
//     res.send(newUser)
// })

app.use("/campgrounds", campgroundRoutes); //all the campgrounds path are gonna start wwth /campgrounds
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
  res.render("home");
});
app.all("*", (req, res, next) => {
  next(new ExpressError("page not found", 404));
});
//something error here my error page is overwritting
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No,Something went wrong ";
  // res.status(statusCode).send(message)
  res.status(statusCode).render("error", { err });
});
app.listen("3000", () => {
  console.log("listening on port 3000");
});
