const Product = require("../models/product");
// const User = require("../models/user");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  console.log(req.profile);
  const { title, imageUrl, price, description } = req.body;
  const product = new Product(
    null,
    title,
    imageUrl,
    price,
    description,
    req.profile._id
  );
  product
    .save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  console.log(prodId);
  Product.findOne(prodId)
    .then(product => {
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
    .catch(err => console.log(err));
  // req.user
  //   .getProducts({ where: { id: prodId } })
  //   .then(products => {
  //     const [product] = products;
  //     if (!product) {
  //       return res.redirect("/");
  //     }
  //     res.render("admin/edit-product", {
  //       pageTitle: "Edit Product",
  //       path: "/admin/edit-product",
  //       editing: editMode,
  //       product
  //     });
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, imageUrl, price, description } = req.body;
  const product = new Product(
    productId,
    title,
    imageUrl,
    price,
    description,
    req.profile._id
  );
  return product
    .save()
    .then(() => {
      console.log("update");
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch(err => {
      console.log(err);
    });
  // req.user
  //   .getProducts()
  //   .then(products => {
  //     res.render("admin/products", {
  //       prods: products,
  //       pageTitle: "Admin Products",
  //       path: "/admin/products"
  //     });
  //   })
  //   .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId);
  Product.deleteOne(prodId)
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
    });
};
