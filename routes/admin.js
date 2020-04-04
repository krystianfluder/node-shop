const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");
const router = express.Router();

router.use(isAuth, isAdmin);

router.get("/add-product", adminController.getAddProduct);

router.get("/products", adminController.getProducts);

router.post("/add-product", adminController.postAddProduct);

router.get("/edit-product/:productId", adminController.getEditProduct);

router.post("/edit-product", adminController.postEditProduct);

router.post("/delete-product", adminController.postDeleteProduct);

module.exports = router;
