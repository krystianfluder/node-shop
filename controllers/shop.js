const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const moment = require("moment");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const Product = require("../models/product");
const Order = require("../models/order");
const { transporter } = require("../config/mails");
const { handleError500 } = require("../util/errors");
const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE);

const { generateHr, generateHeader } = require("../util/invoices");

exports.getProducts = async (req, res, next) => {
  let page = req.query.page;
  if (!page) {
    page = 1;
  }

  const totalProducts = await Product.find().countDocuments();

  const products = await Product.find()
    .sort({
      createdAt: "desc",
    })
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .select("price title imageUrlSmall")
    .lean();

  res.render("shop/product-list", {
    pageTitle: "All Products",
    pageDescription: "lorem",
    products,
    totalProducts,
    currentPage: page,
    hasPrev: page > 1,
    hasNext: page * ITEMS_PER_PAGE < totalProducts,
    firstPage: 1,
    lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
  });
};

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;
  Product.findById(productId)
    .lean()
    .then((product) => {
      res.render("shop/product-detail", {
        product,
        pageTitle: product.title,
        pageDescription: "lorem",
      });
    })
    .catch((err) => {
      return next(handleError500(err));
    });
};

exports.getCart = async (req, res, next) => {
  let message = req.flash("error");

  const { profile } = req;
  await profile.populate("cart.items.productId").execPopulate();

  const products = profile.cart.items;
  const parseProducts = [];
  let totalPrice = 0;

  products.forEach((product) => {
    if (product.productId) {
      totalPrice += product.productId.price * product.quantity;
      parseProducts.push(product);
    }
  });

  if (products.length !== parseProducts.length) {
    message = "Non-existent products have been removed";
    profile.cart.items = parseProducts;
    await profile.save();
  } else {
    message = null;
  }

  res.render("shop/cart", {
    pageTitle: "Your Cart",
    pageDescription: "lorem",
    products: parseProducts,
    errorMessage: message,
    totalPrice,
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
      return res.status(500).json({
        message: "Cart Items Error",
      });
    });
};

exports.postCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  if (!productId) {
    const error = new Error("ProductId does not exist");
    error.status = 400;
    return next();
  }

  const product = await Product.findById(productId);

  await req.profile.addToCart(product, quantity);

  res.redirect("/cart");
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  req.profile
    .removeFromCart(productId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      return next(handleError500(err));
    });
};

exports.getOrders = async (req, res, next) => {
  let page = req.query.page;
  if (!page) {
    page = 1;
  }

  const totalOrders = await Order.find({
    "profile.profileId": req.profile._id,
    paid: true,
  }).countDocuments();

  const orders = await Order.find({
    "profile.profileId": req.profile._id,
    paid: true,
  })
    .sort({
      createdAt: "desc",
    })
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .select("createdAt totalPrice products status paid")
    .lean();

  // beautiful createdAt
  const parseOrders = [];

  orders.forEach((order) => {
    parseOrders.push({
      ...order,
      createdAt: moment(order.createdAt).format("LLL"),
    });
  });

  res.render("shop/paid-orders", {
    pageTitle: "Paid orders",
    pageDescription: "lorem",
    orders: parseOrders,
    totalOrders,
    currentPage: page,
    hasPrev: page > 1,
    hasNext: page * ITEMS_PER_PAGE < totalOrders,
    firstPage: 1,
    lastPage: Math.ceil(totalOrders / ITEMS_PER_PAGE),
  });
};

exports.getUnpaidOrders = async (req, res, next) => {
  let page = req.query.page;
  if (!page) {
    page = 1;
  }

  const totalOrders = await Order.find({
    "profile.profileId": req.profile._id,
    paid: false,
  }).countDocuments();

  const orders = await Order.find({
    "profile.profileId": req.profile._id,
    paid: false,
  })
    .sort({
      createdAt: "desc",
    })
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .select("createdAt totalPrice products status paid session.id")
    .lean();

  // beautiful createdAt

  const parseOrders = [];

  orders.forEach((order) => {
    parseOrders.push({
      ...order,
      createdAt: moment(order.createdAt).format("LLL"),
    });
  });

  res.render("shop/unpaid-orders", {
    pageTitle: "Unpaid orders",
    pageDescription: "lorem",
    orders: parseOrders,
    totalOrders,
    currentPage: page,
    hasPrev: page > 1,
    hasNext: page * ITEMS_PER_PAGE < totalOrders,
    firstPage: 1,
    lastPage: Math.ceil(totalOrders / ITEMS_PER_PAGE),
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
          return next(new Error("Not found pdf file"));
        }
        const file = fs.createReadStream(invoicePath);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
        file.pipe(res);
      });
    })
    .catch((err) => {
      return next(handleError500(err));
    });
};

exports.getCheckout = async (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    pageDescription: "lorem",
  });
};

exports.postCheckout = async (req, res, next) => {
  const { products } = req.body;

  if (!products) {
    return next(handleError("Cart does not exist", 400));
  }

  let productsIds = [];

  products.forEach((product) => {
    productsIds.push(product._id);
  });

  const productsCounter = await Product.find({
    _id: productsIds,
  }).countDocuments();

  if (productsCounter !== products.length) {
    return next(handleError("One of the products does not exist", 400));
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
    session,
    totalPrice,
  });

  await Promise.all([profile.clearCart(), order.save()]);

  const doc = new PDFDocument();
  const writeStream = fs.createWriteStream(
    `data/invoices/invoice-${order._id}.pdf`
  );
  doc.pipe(writeStream);

  generateHeader(doc);

  const shipping = {
    address: "1234 Main Street",
    city: "San Francisco",
    state: "CA",
    country: "US",
    postal_code: 94111,
  };

  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

  generateHr(doc, 185);

  doc
    .fontSize(10)
    .text(`Invoice Number: ${order._id}`, 50, 200)
    .text(`Invoice Date: ${moment(order.createdAt).format("LLL")}`, 50, 215)
    .text(`Balance Due: ${totalPrice / 100} ${process.env.CURRENCY}`, 50, 230)
    .text(profile.email, 300, 200)
    .text(shipping.address, 300, 215)
    .text(`${shipping.city}, ${shipping.state}, ${shipping.country}`, 300, 230)
    .moveDown();

  generateHr(doc, 252);

  doc.fillColor("#444444").fontSize(20).text("Products", 50, 330);
  doc.fontSize(10);
  doc.moveDown();

  orderProducts.forEach(({ product, quantity }) => {
    const { title } = product;

    const lineTotal = `${((product.price * quantity) / 100).toFixed(2)} ${
      process.env.CURRENCY
    }`;

    const price = `${(product.price / 100).toFixed(2)} ${process.env.CURRENCY}`;

    doc.image(product.imageUrlSmall, { width: 70 }).moveDown();

    doc.text(title).text(`${price} * ${quantity} = ${lineTotal}`).moveDown();
  });

  doc
    .text(
      `Balance Due: ${(totalPrice / 100).toFixed(2)} ${process.env.CURRENCY}`,
      {
        align: "right",
      }
    )
    .moveDown();

  doc.end();

  writeStream.on("finish", async () => {
    await transporter.sendMail({
      from: process.env.SERVER_EMAIL,
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
    pageDescription: "lorem",
    session,
  });
};

exports.getCheckoutSuccess = async (req, res, next) => {
  res.render("shop/checkout-success", {
    pageTitle: "Checkout success",
    pageDescription: "lorem",
  });
};

exports.getCheckoutCancel = async (req, res, next) => {
  res.render("shop/checkout-cancel", {
    pageTitle: "Checkout cancel",
    pageDescription: "lorem",
  });
};
