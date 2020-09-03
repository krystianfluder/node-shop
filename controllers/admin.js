const sharp = require("sharp");
const Product = require("../models/product");
const Order = require("../models/order");
const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");
const { handleError500 } = require("../util/errors");
const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE);

const editorjs = require("../util/editorjs");

// https://editorjs.io/

exports.getAddProduct = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    pageDescription: "lorem",
    editing: false,
    errorMessage: message,
    product: {
      title: "",
      imageUrl: "",
      price: "",
      description: "[]",
      productId: "",
    },
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const errors = validationResult(req);

  // const parseCents = price();

  const response = (errorMessage, validationErrors) => {
    res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      pageDescription: "lorem",
      editing: false,
      product: {
        title,
        price,
        description,
      },
      errorMessage,
      validationErrors,
    });
  };

  if (!errors.isEmpty()) return response(errors.array()[0].msg, errors.array());
  if (!req.file) return response("Image", []);

  const pathTab = req.file.path.split("/");
  const filename = pathTab[pathTab.length - 1];

  sharp(req.file.path)
    .resize(200, 200)
    .toFile(`images/small-${filename}`, (err, info) => {
      if (err) {
        return next(handleError500(err));
      }
    });

  const product = new Product({
    title,
    imageUrl: req.file.path,
    imageUrlSmall: `images/small-${filename}`,
    price,
    description,
    html: editorjs.getHtml(JSON.parse(description)),
    profileId: req.profile,
  });
  product
    .save()
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      return next(handleError500(err));
    });
};

exports.getEditProduct = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const { productId } = req.params;
  Product.findById(productId)
    .lean()
    .then((product) => {
      if (!product) {
        return res.redirect("/admin/products");
      }
      return res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        pageDescription: "lorem",
        editing: editMode,
        product,
        errorMessage: message,
        validationErrors: [],
      });
    })
    .catch((err) => {
      return next(handleError500(err));
    });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, description } = req.body;
  const errors = validationResult(req);

  const response = (errorMessage, validationErrors) =>
    res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      pageDescription: "lorem",
      editing: true,
      product: {
        _id: productId,
        title,
        price,
        description,
      },
      errorMessage,
      validationErrors,
    });

  if (!errors.isEmpty()) return response(errors.array()[0].msg, errors.array());
  if (!req.file) return response("Image", []);

  const pathTab = req.file.path.split("/");
  const filename = pathTab[pathTab.length - 1];

  sharp(req.file.path)
    .resize(200, 200)
    .toFile(`images/small-${filename}`, (err, info) => {
      if (err) {
        return next(handleError500(err));
      }
    });

  Product.findById(productId)
    .then((product) => {
      fileHelper.deleteFile(product.imageUrl);
      fileHelper.deleteFile(product.imageUrlSmall);

      product.title = title;
      product.imageUrl = req.file.path;
      product.imageUrlSmall = `images/small-${filename}`;
      product.price = price;
      product.description = description;
      product.html = editorjs.getHtml(JSON.parse(description));

      return product.save();
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      return next(handleError500(err));
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .lean()
    .then((products) => {
      res.render("admin/products", {
        products,
        pageTitle: "Admin Products",
      });
    })
    .catch((err) => {
      return next(handleError500(err));
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  Product.findByIdAndDelete(productId)
    .then((product) => {
      fileHelper.deleteFile(product.imageUrl);
      res.redirect("/admin/products");
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
  const totalOrders = await Order.countDocuments();
  const orders = await Order.find({})
    .select("profile products totalPrice createdAt status paid")
    .sort({
      createdAt: "desc",
    })
    .populate("profile.profileId", "email createdAt")
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);

  res.render("admin/orders", {
    pageTitle: "Admin Products",
    pageDescription: "lorem",
    orders,
    totalOrders,
    currentPage: page,
    hasPrev: page > 1,
    hasNext: page * ITEMS_PER_PAGE < totalOrders,
    firstPage: 1,
    lastPage: Math.ceil(totalOrders / ITEMS_PER_PAGE),
  });
};

exports.postOrderDelivered = async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).select("_id");
  order.status = "provided";
  await order.save();

  res.redirect("/admin/orders");
};
