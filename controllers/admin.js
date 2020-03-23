const Product = require("../models/product");
const User = require("../models/user");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const { user } = req;
  const { title, imageUrl, price, description } = req.body;
  user
    .createProduct({
      title,
      imageUrl,
      price,
      description
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  req.user
    .getProducts({ where: { id: prodId } })
    .then(products => {
      const [product] = products;
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, imageUrl, description } = req.body;
  Product.findByPk(productId)
    .then(product => {
      product
        .update({
          title,
          price,
          imageUrl,
          description
        })
        .then(() => {
          res.redirect("/admin/products");
        })
        .catch(err => {
          console.log(err);
          res.redirect("/admin/products");
        });
    })
    .catch(err => {
      console.log(err);
      res.redirect("/admin/products");
    });
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then(product => {
      product.destroy();
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
      res.redirect("/admin/products");
    });
};
