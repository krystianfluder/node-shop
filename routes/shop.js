const express = require("express");

const shopController = require("../controllers/shop");
const { isAuth, isAdmin } = require("../middleware/auth");
const { catchAsync } = require("../middleware/errors");

const router = express.Router();

router.get("/", catchAsync(shopController.getProducts));

router.get("/products", catchAsync(shopController.getProducts));

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, catchAsync(shopController.postCart));

router.get("/cart-items", isAuth, shopController.getCartItems);

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

router.get("/orders", isAuth, catchAsync(shopController.getOrders));

router.get(
  "/unpaid-orders",
  isAuth,
  catchAsync(shopController.getUnpaidOrders)
);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.get("/checkout", isAuth, catchAsync(shopController.getCheckout));

router.get(
  "/checkout/success",
  isAuth,
  catchAsync(shopController.getCheckoutSuccess)
);

router.get(
  "/checkout/cancel",
  isAuth,
  catchAsync(shopController.getCheckoutCancel)
);

router.post("/checkout", isAuth, catchAsync(shopController.postCheckout));

module.exports = router;
