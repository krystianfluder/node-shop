const path = require("path");
const fs = require("fs");
const Product = require("../models/product");
const Order = require("../models/order");

exports.getIndex = (req, res, next) => {
  Product.find()
    // .select("title -name")
    // .populate("profileId", "cart")
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.profile
    .populate("cart.items.productId")
    .execPopulate()
    .then((profile) => {
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: profile.cart.items,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      req.profile.addToCart(product);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.profile
    .removeFromCart(prodId)
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "profile.profileId": req.profile._id })
    .then((orders) => {
      console.log(orders);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Orders",
        orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const { orderId } = req.params;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found"));
      }
      if (order.profile.profileId.toString() !== req.profile._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join(__dirname, "data", "invoices", invoiceName);
      fs.exists(invoicePath, (exist) => {
        console.log(exist, invoicePath);
        if (!exist) {
          return res.redirect("/orders");
        }
      });

      const file = fs.createReadStream(invoicePath);
      res.setHeader({ "Content-Type": "application/pdf" });
      res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  req.profile
    .populate("cart.items.productId")
    .execPopulate()
    .then((profile) => {
      const { email } = profile;
      const products = profile.cart.items;
      console.log(profile);
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products,
        email,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.postCheckout = (req, res, next) => {
  req.profile
    .populate("cart.items.productId")
    .execPopulate()
    .then((profile) => {
      const products = profile.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc },
        };
      });
      const order = new Order({
        profile: {
          profileId: req.profile._id,
        },
        products,
      });
      return order.save();
    })
    .then(() => {
      return req.profile.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};
