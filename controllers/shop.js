const { ObjectID } = require("mongodb");

const Product = require("../models/product");
const Profile = require("../models/profile");
// const Cart = require("../models/cart");
// const Order = require("../models/order");

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/"
      });
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products"
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findOne(prodId)
    .then(product => {
      res.render("shop/product-detail", {
        product,
        pageTitle: product.title,
        path: "/products"
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.profile
    .getCart()
    .then(products => {
      console.log(products);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findOne(prodId)
    .then(product => {
      req.profile.addToCart(product);
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.profile
    .deleteFromCart(prodId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.profile
    .getOrders()
    .then(orders => {
      console.log(orders);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Orders",
        orders
      });
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  const { name, email } = req.profile;
  req.profile
    .getCart()
    .then(products => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products,
        name,
        email
      });
    })
    .catch(err => console.log(err));
};

exports.postCheckout = (req, res, next) => {
  req.profile
    .addOrder()
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => console.log(err));
};
