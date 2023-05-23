const express = require("express");
const passport = require("passport");
// const user = require('../models/user')
const router = express.Router();
// const User = require('../models/user')
const catchAsync = require("../utils/catchAsync");
const { route } = require("./campgrounds");
// const { route } = require('./campgrounds')
const users = require("../controllers/users");
router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.register));
// router.get('/register', users.renderRegister)
// router.post('/register', catchAsync(users.register))

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );
// logout is not working ! check this  https://www.udemy.com/course/the-web-developer-bootcamp/learn/lecture/22346404#questions/19392744/

router.route("/logout").post(users.logout);

module.exports = router;
