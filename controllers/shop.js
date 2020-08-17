const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const Product = require("../models/product");
const Order = require("../models/order");
const { transporter } = require("../config/mails");

const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE);

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

exports.getCartItems = (req, res, next) => {
  req.profile
    .populate("cart.items.productId")
    .execPopulate()
    .then((profile) => {
      const products = profile.cart.items;
      let totalPrice = 0;
      products.forEach((p) => {
        totalPrice += p.quantity * p.productId.price;
      });
      res.json({
        products,
        totalPrice,
      });
    })
    .catch((err) => {
      return res.json({
        message: "Cart Items Error",
      });
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
  let page = req.query.page;
  if (!page) {
    page = 1;
  }
  let totalOrders;

  Order.find({ "profile.profileId": req.profile._id })
    .countDocuments()
    .then((numOrders) => {
      totalOrders = numOrders;
      return Order.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .select("createdAt totalPrice products")
        .lean();
    })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Orders",
        orders,
        totalOrders,
        currentPage: page,
        hasPrev: page > 1,
        hasNext: page * ITEMS_PER_PAGE < totalOrders,
        firstPage: 1,
        lastPage: Math.ceil(totalOrders / ITEMS_PER_PAGE),
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
    .select("profile")
    .lean()
    .then((order) => {
      if (!order) {
        return next(new Error("No order found"));
      }
      if (order.profile.profileId.toString() !== req.profile._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join("data", "invoices", invoiceName);

      fs.access(invoicePath, fs.F_OK, (err) => {
        if (err) {
          console.error(err);
          return next(new Error("Not found pdf file"));
        }
        const file = fs.createReadStream(invoicePath);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
        file.pipe(res);
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.getCheckout = async (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};

exports.postCheckout = async (req, res, next) => {
  const { products } = req.body;

  if (!products) {
    const err = new Error("Cart does not exist");
    err.status = 400;
    return next(err);
  }

  let productsIds = [];

  products.forEach((product) => {
    productsIds.push(product._id);
  });

  const productsCounter = await Product.find({
    _id: productsIds,
  }).countDocuments();

  if (productsCounter !== products.length) {
    const err = new Error("One of the products does not exist");
    err.status = 400;
    return next(err);
  }
  // is valid

  const productsWithPrice = await Product.find({
    _id: productsIds,
  }).lean();

  const { profile } = req;
  const lineItems = [];
  const orderProducts = [];
  let totalPrice = 0;

  productsWithPrice.forEach((product) => {
    const quantity = products.find(
      (item) => product._id.toString() === item._id.toString()
    ).quantity;

    lineItems.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: product.title,
          description: product.description,
        },
        unit_amount: product.price,
      },
      quantity,
    });

    orderProducts.push({
      product,
      quantity,
    });

    totalPrice += quantity * product.price;
  });

  const session = await stripe.checkout.sessions.create({
    customer_email: profile.email,
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
    cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
  });

  const order = new Order({
    profile: {
      profileId: req.profile._id,
    },
    products: orderProducts,
    paid: false,
    session,
    totalPrice,
  });

  await order.save();

  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream(
    `data/invoices/invoice-${order._id}.pdf`
  );
  doc.pipe(writeStream);
  doc.text(`Thank you! ${req.profile.email}`);
  doc.text(`Date of order: ${order.createdAt}`);
  doc.text("Products: ");

  orderProducts.forEach((product) => {
    const price = product.product.price * product.quantity;
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

  writeStream.on("finish", async () => {
    await transporter.sendMail({
      from: "test@test.com",
      to: profile.email,
      subject: "invoice ✔", // Subject line
      // text: "", // plain text body
      html: `<b>HTML</b>`, // html
      attachments: [
        {
          filename: `invoice.pdf`,
          path: path.join(
            __dirname,
            "../data/invoices",
            `invoice-${order._id}.pdf`
          ),
          contentType: "application/pdf",
        },
      ],
    });
  });

  res.json({
    message: "Order created",
    session,
  });
};

exports.getCheckoutSuccess = async (req, res, next) => {
  res.render("shop/checkout-success", {
    pageTitle: "Checkout success",
    path: "/",
  });
};

exports.getCheckoutCancel = async (req, res, next) => {
  res.render("shop/checkout-cancel", {
    pageTitle: "Checkout cancel",
    path: "/",
  });
};
