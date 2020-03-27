// const { ObjectID } = require("mongodb");

const Product = require("../models/product");
// const Profile = require("../models/profile");
// const Cart = require("../models/cart");
const Order = require("../models/order");

exports.getIndex = (req, res, next) => {
  Product.find()
    // .select("title -name")
    // .populate("profileId", "cart")
    .then(products => {
      console.log(products);
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/"
      });
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
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
  Product.findById(prodId)
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
    .populate("cart.items.productId")
    .execPopulate()
    .then(profile => {
      console.log(profile);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: profile.cart.items
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      req.profile.addToCart(product);
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.profile
    .removeFromCart(prodId)
    .then(result => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "profile.profileId": req.profile._id })
    .then(orders => {
      console.log(orders);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Orders",
        orders
      });
    })
    .catch(err => console.log(err));
  // Order.find()
  //   .select("products")
  //   .then(orders => {
  //     console.log(orders);
  //     res
  //       .render("shop/orders", {
  //         path: "/orders",
  //         pageTitle: "Orders",
  //         orders: orders.products
  //       })
  //       .catch(err => console.log(err));
  //   });
  // req.profile
  //   .getOrders()
  //   .then(orders => {
  //     console.log(orders);
  //     res.render("shop/orders", {
  //       path: "/orders",
  //       pageTitle: "Orders",
  //       orders
  //     });
  //   })
  //   .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  req.profile
    .populate("cart.items.productId")
    .execPopulate()
    .then(profile => {
      const { name, email } = profile;
      const products = profile.cart.items;
      console.log(products);
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
    .populate("cart.items.productId")
    .execPopulate()
    .then(profile => {
      const products = profile.cart.items.map(i => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc }
        };
      });
      const order = new Order({
        profile: {
          profileId: req.profile._id
        },
        products
      });
      return order.save();
    })
    .then(() => {
      return req.profile.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => console.log(err));
};
