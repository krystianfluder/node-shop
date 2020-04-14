const { v4 } = require("uuid");
const path = require("path");
const express = require("express");
const multer = require("multer");

const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");
const router = express.Router();

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + v4() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage });
router.use(isAuth, isAdmin);

router.get("/add-product", adminController.getAddProduct);

router.get("/products", adminController.getProducts);

router.post(
  "/add-product",
  upload.single("image"),
  [
    body("title")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("Please enter a valid title, least 3 chars")
      .isAlphanumeric()
      .withMessage("Please enter a valid title, alphanumeric"),
    body("price")
      .trim()
      .escape()
      .isNumeric()
      .withMessage("Please enter a valid price"),
    body("description")
      .trim()
      .escape()
      .isLength({ min: 10 })
      .withMessage("Please enter a valid title, least 10 chars"),
  ],

  adminController.postAddProduct
);

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post(
  "/edit-product",
  upload.single("image"),
  [
    body("title")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("Please enter a valid title, least 3 chars")
      .isAlphanumeric()
      .withMessage("Please enter a valid title, alphanumeric"),
    body("price")
      .trim()
      .escape()
      .isNumeric()
      .withMessage("Please enter a valid price"),
    body("description")
      .trim()
      .escape()
      .isLength({ min: 10 })
      .withMessage("Please enter a valid title, least 10 chars"),
  ],
  adminController.postEditProduct
);

router.post("/delete-product", adminController.postDeleteProduct);

module.exports = router;
