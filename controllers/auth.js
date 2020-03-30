const bcrypt = require("bcryptjs");
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

  Profile.findOne({ email })
    .then(profile => {
      if (!profile) {
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, profile.password)
        .then(result => {
          if (result) {
            req.session.isLoggedIn = true;
            req.session.profile = profile;
            return req.session.save(err => {
              if (err) console.log(err);
              return res.redirect("/");
            });
          }
          res.redirect("/login");
        })
        .catch(err => {
          res.redirect("/login");
          console.log(err);
        });
    })
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
  console.log(email, password, password2);

  if (password !== password2) {
    return res.redirect("/register");
  }
  Profile.findOne({ email })
    .then(profileData => {
      if (profileData) {
        return res.redirect("/register");
      }
      return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
      const profile = new Profile({
        email,
        password: hashedPassword,
        cart: { items: [] }
      });
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
