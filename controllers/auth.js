const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Profile = require("../models/profile");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.getRegister = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/register", {
    path: "/register",
    pageTitle: "Register",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  Profile.findOne({ email })
    .then((profile) => {
      if (!profile) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, profile.password)
        .then((result) => {
          if (result) {
            req.session.isLoggedIn = true;
            req.session.profile = profile;
            return req.session.save((err) => {
              if (err) console.log(err);
              return res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password.");
          res.redirect("/login");
        })
        .catch((err) => {
          res.redirect("/login");
          console.log(err);
        });
    })
    .catch((err) => console.log(err));
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

  if (email === "") {
    req.flash("error", "Email is invalid.");
    return res.redirect("/register");
  }

  if (password !== password2) {
    req.flash("error", "Different passwords.");
    return res.redirect("/register");
  }

  Profile.findOne({ email })
    .then((profileData) => {
      if (profileData) {
        req.flash("error", "Email exists.");
        return res.redirect("/register");
      }
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      const profile = new Profile({
        email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return profile.save();
    })
    .then(() => {
      res.redirect("/login");
      const msg = {
        to: email,
        from: "test@example.com",
        subject: "Sending with Twilio SendGrid is Fun",
        text: "and easy to do anywhere, even with Node.js",
        html: "<strong>and easy to do anywhere, even with Node.js</strong>",
      };
      sgMail.send(msg);
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    console.log(token);
  });
};
