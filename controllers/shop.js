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

// exports.getProducts = (req, res, next) => {
//   Product.findAll()
//     .then(products => {
//       res.render("shop/product-list", {
//         prods: products,
//         pageTitle: "All Products",
//         path: "/products"
//       });
//     })
//     .catch(err => console.log(err));
// };

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
      return req.profile.addToCart(product);
    })
    .catch(err => console.log(err));

  // let fetchedCart;
  // let newQuantity = 1;
  // req.user
  //   .getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then(products => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }

  //     if (product) {
  //       const oldQuantity = product.cartitem.dataValues.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }
  //     return Product.findByPk(prodId);
  //   })
  //   .then(product => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity }
  //     });
  //   })
  //   .then(() => {
  //     res.redirect("/cart");
  //   })
  //   .catch(err => console.log(err));
};

// exports.postCartDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   req.user
//     .getCart()
//     .then(cart => {
//       cart.getProducts({ where: { id: prodId } }).then(products => {
//         let product;
//         if (products.length > 0) {
//           product = products[0];
//         }
//         if (product) {
//           product.cartitem.destroy();
//           res.redirect("/cart");
//         }
//       });
//     })
//     .catch(err => console.log(err));
// };

// exports.getOrders = (req, res, next) => {
//   req.user
//     .getOrders()
//     .then(orders => {
//       console.log(orders);
//       res.render("shop/orders", {
//         path: "/orders",
//         pageTitle: "Your Orders",
//         orders
//       });
//     })
//     .catch(err => console.log(err));
// };

// exports.getCheckout = (req, res, next) => {
//   req.user
//     .getCart()
//     .then(cart => {
//       return cart
//         .getProducts()
//         .then(products => {
//           const { name, email } = req.user.dataValues;
//           res.render("shop/checkout", {
//             path: "/checkout",
//             pageTitle: "Checkout",
//             products,
//             name,
//             email
//           });
//         })
//         .catch(err => console.log(err));
//     })
//     .catch(err => console.log(err));
// };

// exports.postCheckout = (req, res, next) => {
//   req.user
//     .getCart()
//     .then(cart => {
//       return cart.getProducts();
//     })
//     .then(products => {
//       req.user
//         .createOrder({
//           products
//         })
//         .then(order => {
//           console.log(order);
//           // return order.addProducts(
//           //   products.map(product => {
//           //     // console.log(product.dataValues.cartitem.dataValues.quantity);
//           //     const qty = product.dataValues.cartitem.dataValues.quantity;
//           //     console.log(product.dataValues);
//           //     // product.dataValues.orderitem.dataValues.quantity = qty;
//           //     // product.dataValues.orderitem = {
//           //     //   quantity: product.dataValues.cartitem.dataValues.quantity
//           //     // };
//           //     return product;
//           //   })
//           // );
//         })
//         .catch(err => console.log(err));
//       // console.log(products);
//     })
//     .catch(err => {
//       console.log(err);
//     });
// };
