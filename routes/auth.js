const express = require("express");
const rateLimit = require("express-rate-limit");

const Profile = require("../models/profile");
const { body } = require("express-validator");

const router = express.Router();

const authController = require("../controllers/auth");
const { isAuth } = require("../middleware/auth");

router.get("/login", authController.getLogin);

router.get("/register", authController.getRegister);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .normalizeEmail({ gmail_remove_dots: false })
      .isEmail()
      .withMessage("Please enter a valid email."),
    body("password")
      .isLength({ min: 8 })
      .escape()
      .withMessage("Please enter password at least 8 characters."),
  ],
  authController.postLogin
);

// const createAccountLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour window
//   max: 5, // start blocking after 5 requests
//   message:
//     "Too many accounts created from this IP, please try again after an hour",
// });

router.post(
  "/register",
  [
    body("email")
      .trim()
      .normalizeEmail({ gmail_remove_dots: false })
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return Profile.findOne({ email: value }).then((profileData) => {
          if (profileData) {
            return Promise.reject("Email exists");
          }
        });
      }),
    body("password")
      .escape()
      .isLength({ min: 8 })
      .withMessage("Please enter password at least 8 characters."),
    body("password2")
      .escape()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords don't match");
        }
        return true;
      }),
  ],
  // createAccountLimiter,
  authController.postRegister
);

router.post("/logout", isAuth, authController.postLogout);

router.get("/reset", authController.getReset);

// const resetAccountLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour window
//   max: 5, // start blocking after 5 requests
//   message:
//     "Reset",
// });

router.post(
  "/reset",
  // resetAccountLimiter,
  authController.postReset
);

router.get("/new-password", authController.getNewPassword);

router.get("/new-password/:token", authController.getNewPasswordWithToken);

router.post(
  "/new-password",
  [
    body("token").escape(),
    body("password")
      .isLength({ min: 8 })
      .escape()
      .withMessage("Please enter password at least 8 characters."),
  ],
  authController.postNewPassword
);

module.exports = router;
