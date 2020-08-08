const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const sgMail = require("@sendgrid/mail");
const Product = require("../models/product");
const Order = require("../models/order");

sgMail.setApiKey(process.env.SENDGRID_KEY);

const ITEMS_PER_PAGE = 2;

exports.getIndex = (req, res, next) => {
  let page = req.query.page;
  if (!page) {
    page = 1;
  }
  let totalProducts;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalProducts = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        totalProducts,
        currentPage: page,
        hasPrev: page > 1,
        hasNext: page * ITEMS_PER_PAGE < totalProducts,
        firstPage: 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
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

// fix empty - product does not exist
exports.getCart = (req, res, next) => {
  req.profile
    .populate("cart.items.productId")
    .execPopulate()
    .then((profile) => {
      const products = profile.cart.items;
      let totalPrice = 0;
      products.forEach((p) => {
        totalPrice += p.quantity * p.productId.price;
      });
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products,
        totalPrice,
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
      const invoicePath = path.join("data", "invoices", invoiceName);
      const file = fs.createReadStream(invoicePath);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
      file.pipe(res);
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let totalPrice = 0;
  let email;
  req.profile
    .populate("cart.items.productId")
    .execPopulate()
    .then((profile) => {
      products = profile.cart.items;
      totalPrice = 0;
      products.forEach((p) => {
        totalPrice += p.quantity * p.productId.price;
      });
      email = profile.email;

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price,
            currency: "eur",
            quantity: p.quantity,
          };
        }),
        success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products,
        email,
        totalPrice,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
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
    .then((order) => {
      return order;
    })
    .then((order) => {
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(`data/invoices/invoice-${order._id}.pdf`));
      doc.text(`Thank you! ${req.profile.email}`);
      doc.text(`Date of order: ${order.createdAt}`);
      doc.text("Products: ");
      let totalPrice = 0;
      order.products.forEach((product) => {
        const price = product.product.price * product.quantity;
        totalPrice += price;
        doc.text(
          `${product.product.title} x ${product.quantity} || ${product.product.price} x ${product.quantity} = ${price}`
        );
        doc.image(product.product.imageUrl, {
          fit: [200, 200],
          align: "left",
        });
      });
      doc.text(`Total price: ${totalPrice}`);
      doc.end();
      req.profile.clearCart();
      res.redirect("/orders");
      const msg = {
        to: req.profile.email,
        from: "test@example.com",
        subject: "Thank you for order",
        html: `<strong><a href="${process.env.BASE_URL}/orders/${order._id}">Invoice</a></strong>`,
      };
      sgMail.send(msg);
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
    .then((order) => {
      return order;
    })
    .then((order) => {
      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(`data/invoices/invoice-${order._id}.pdf`));
      doc.text(`Thank you! ${req.profile.email}`);
      doc.text(`Date of order: ${order.createdAt}`);
      doc.text("Products: ");
      let totalPrice = 0;
      order.products.forEach((product) => {
        const price = product.product.price * product.quantity;
        totalPrice += price;
        doc.text(
          `${product.product.title} x ${product.quantity} || ${product.product.price} x ${product.quantity} = ${price}`
        );
        doc.image(product.product.imageUrl, {
          fit: [200, 200],
          align: "left",
        });
      });
      doc.text(`Total price: ${totalPrice}`);
      doc.end();
      req.profile.clearCart();
      res.redirect("/orders");
      const msg = {
        to: req.profile.email,
        from: "test@example.com",
        subject: "Thank you for order",
        html: `<strong><a href="${process.env.BASE_URL}/orders/${order._id}">Invoice</a></strong>`,
      };
      sgMail.send(msg);
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};
