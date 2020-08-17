const { v4 } = require("uuid");
const sharp = require("sharp");
const Product = require("../models/product");
const Order = require("../models/order");
const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");

const ITEMS_PER_PAGE = parseInt(process.env.ITEMS_PER_PAGE);

exports.getAddProduct = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    errorMessage: message,
    product: {
      title: "",
      imageUrl: "",
      price: "",
      description: "",
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
      path: "/admin/add-product",
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
      console.log(err, info);
    });

  const product = new Product({
    title,
    imageUrl: req.file.path,
    imageUrlSmall: `images/small-${filename}`,
    price,
    description,
    profileId: req.profile,
  });
  product
    .save()
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
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
  const prodId = req.params.productId;
  console.log(prodId);
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/admin/products");
      }
      console.log(product);
      return res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product,
        errorMessage: message,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, description } = req.body;
  const errors = validationResult(req);

  const response = (errorMessage, validationErrors) =>
    res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
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

  Product.findById(productId)
    .then((product) => {
      product.title = title;
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = req.file.path;
      product.price = price;
      product.description = description;
      return product.save();
    })
    .then((product) => {
      res.redirect("/admin/products");
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
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findByIdAndDelete(prodId)
    .then((product) => {
      fileHelper.deleteFile(product.imageUrl);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.status = 500;
      return next(error);
    });
};

exports.getOrders = async (req, res, next) => {
  let page = req.query.page;
  if (!page) {
    page = 1;
  }

  const totalOrders = await Order.countDocuments();

  const orders = await Order.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .select("totalPrice createdAt products")
    .populate("profile");

  res.render("admin/orders", {
    pageTitle: "Admin Products",
    path: "/admin/orders",
    orders,
    totalOrders,
    currentPage: page,
    hasPrev: page > 1,
    hasNext: page * ITEMS_PER_PAGE < totalOrders,
    firstPage: 1,
    lastPage: Math.ceil(totalOrders / ITEMS_PER_PAGE),
  });
};
