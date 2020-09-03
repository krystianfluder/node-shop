const { validationResult } = require("express-validator");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { transporter } = require("../config/mails");
const Profile = require("../models/profile");
const { handleError500 } = require("../util/errors");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    pageDescription: "lorem",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
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
    pageTitle: "Register",
    pageDescription: "lorem",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      password2: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const errors = validationResult(req);
  const { email, password } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      pageDescription: "lorem",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
      },
      validationErrors: errors.array(),
    });
  }

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
            if (profile.isAdmin) {
              req.session.isAdmin = true;
            }
            return req.session.save((err) => {
              if (err) console.log(err);
              return res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password.");
          res.redirect("/login");
        })
        .catch((err) => {
          return next(handleError500(err));
        });
    })
    .catch((err) => {
      return next(handleError500(err));
    });
};

exports.postRegister = (req, res, next) => {
  const errors = validationResult(req);
  const { email, password, password2 } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/register", {
      pageTitle: "Register",
      pageDescription: "lorem",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        password2,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const profile = new Profile({
        email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return profile.save();
    })
    .then(() => {
      transporter
        .sendMail({
          from: process.env.SERVER_EMAIL,
          to: email,
          subject: "register",
          html: `<b>${email}</b>`, // html
        })
        .catch((err) => {
          return next(handleError500(err));
        });
      return res.redirect("/login");
    })
    .catch((err) => {
      return next(handleError500(err));
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(handleError500(err));
    return res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    pageDescription: "lorem",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return next(handleError500(err));
    }
    const token = buffer.toString("hex");
    Profile.findOne({ email: req.body.email })
      .then((profile) => {
        if (!profile) {
          req.flash("error", "Email not exist");
          return res.redirect("/reset");
        }
        profile.resetToken = token;
        profile.resetTokenExpiration = Date.now() + 3600000;
        return profile.save();
      })
      .then((profile) => {
        if (profile) {
          transporter
            .sendMail({
              from: process.env.SERVER_EMAIL,
              to: profile.email,
              subject: "Reset password",
              html: `
            <p>You requested a password reset</p>
            <p>Code: ${token}</p>
            <p>Click this <a href="${process.env.BASE_URL}/new-password/${token}">link</a> to set a new password</p>
          `,
            })
            .catch((err) => {
              return next(handleError500(err));
            });
          res.redirect("/new-password");
        }
      })
      .catch((err) => {
        return next(handleError500(err));
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/new-password", {
    pageTitle: "Set new password",
    pageDescription: "lorem",
    errorMessage: message,
    token: "",
  });
};

exports.getNewPasswordWithToken = (req, res, next) => {
  const { token } = req.params;
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/new-password", {
    pageTitle: "Set new password",
    pageDescription: "lorem",
    errorMessage: message,
    token,
  });
};

exports.postNewPassword = (req, res, next) => {
  const { token, password } = req.body;
  let resetProfile;
  Profile.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((profile) => {
      if (!profile) {
        req.flash("error", "Token is invalid or expired");
        return res.redirect(`/new-password/${token}`);
      }
      resetProfile = profile;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      if (hashedPassword) {
        resetProfile.password = hashedPassword;
        resetProfile.resetToken = undefined;
        resetProfile.resetTokenExpiration = undefined;
        return resetProfile.save();
      }
    })
    .then((result) => {
      if (result) {
        return res.redirect("/login");
      }
    })
    .catch((err) => {
      return next(handleError500(err));
    });
};
