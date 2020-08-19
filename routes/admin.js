const { v4 } = require("uuid");
const express = require("express");
const multer = require("multer");

const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const { isAdmin, isAuth } = require("../middleware/auth");
const { catchAsync } = require("../middleware/errors");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + v4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });
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
      .withMessage("Please enter a valid title, least 3 chars"),
    // .isAlphanumeric()
    // .withMessage("Please enter a valid title, alphanumeric"),
    body("price")
      .trim()
      .escape()
      .isNumeric()
      .withMessage("Please enter a valid price"),
    body("description")
      .trim()
      .escape()
      .isLength({ min: 10 })
      .withMessage("Please enter a valid description, least 10 chars"),
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
      .withMessage("Please enter a valid title, least 3 chars"),
    // .isAlphanumeric()
    // .withMessage("Please enter a valid title, alphanumeric"),
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

router.get("/orders", catchAsync(adminController.getOrders));

router.post(
  "/order-delivered/:orderId",
  catchAsync(adminController.postOrderDelivered)
);

module.exports = router;
