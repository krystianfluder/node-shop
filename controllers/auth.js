const Profile = require("../models/profile");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.getRegister = (req, res, next) => {
  res.render("auth/register", {
    path: "/register",
    pageTitle: "Register",
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
  Profile.findById("5e7c89866fa64f14a3c663b4")
    .then(profile => {
      req.session.isLoggedIn = true;
      req.session.profile = profile;
      req.session.save(err => {
        if (err) console.log(err);
        res.redirect("/");
      });
    })
    .then(() => {})
    .catch(err => console.log(err));
  // res.setHeader(
  //   "Set-Cookie",
  //   `loogedIn=false; expires=${new Date(
  //     new Date().getTime() + 1000 * 3600
  //   )}; HttpOnly=true`
  // );
  // req.session.isLoggedIn = true;
};

exports.postRegister = (req, res, next) => {};

exports.postLogout = (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
};
