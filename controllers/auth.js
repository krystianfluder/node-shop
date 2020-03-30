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
  const { email, password } = req.body;
  Profile.find({ email })
    .then(profileData => {
      const [profile] = profileData;
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

exports.postRegister = (req, res, next) => {
  const { email, password, password2 } = req.body;

  Profile.find({ email })
    .then(profileData => {
      if (!profileData) {
        return res.redirect("/register");
      }
      const profile = new Profile({ email, password, cart: { items: [] } });
      return profile.save();
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
};
