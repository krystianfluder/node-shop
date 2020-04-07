const path = require("path");

const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");
const router = express.Router();

router.use(isAuth, isAdmin);

router.get("/add-product", adminController.getAddProduct);

router.get("/products", adminController.getProducts);

router.post(
  "/add-product",
  [
    body("title")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("Please enter a valid title, least 3 chars")
      .isAlphanumeric()
      .withMessage("Please enter a valid title, alphanumeric"),
    body("imageUrl").trim().isURL().withMessage("Please enter a valid URL"),
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
  [
    body("title")
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage("Please enter a valid title, least 3 chars")
      .isAlphanumeric()
      .withMessage("Please enter a valid title, alphanumeric"),
    body("imageUrl").trim().isURL().withMessage("Please enter a valid URL"),
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
