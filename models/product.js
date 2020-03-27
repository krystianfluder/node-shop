const mongoose = require("mongoose");

const { Schema } = mongoose;

const productSchema = Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

// const { ObjectID } = require("mongodb");
// const { getDb } = require("../util/database2");

// class Product {
//   constructor(id, title, imageUrl, price, description, profileId) {
//     this.id = id;
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.price = price;
//     this.description = description;
//     this.profileId = profileId;
//   }

//   save() {
//     const collection = getDb().collection("products");
//     const { id, title, imageUrl, description, price, profileId } = this;
//     if (id) {
//       //update
//       return collection
//         .updateOne(
//           {
//             _id: ObjectID(id)
//           },
//           {
//             $set: {
//               title,
//               imageUrl,
//               price,
//               description,
//               profileId
//             }
//           }
//         )
//         .then(result => {
//           console.log(result);
//         })
//         .catch(err => {
//           console.log(err);
//         });
//     } else {
//       //create
//       return collection
//         .insertOne({
//           title,
//           imageUrl,
//           price,
//           description,
//           profileId
//         })
//         .then(result => {
//           console.log(result);
//         })
//         .catch(err => {
//           console.log(err);
//         });
//     }
//   }

//   static deleteOne = id => {
//     const collection = getDb().collection("products");
//     return collection
//       .deleteOne({ _id: ObjectID(id) })
//       .then(result => {
//         console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   };

//   static findAll = () => {
//     const collection = getDb().collection("products");
//     return collection
//       .find()
//       .toArray()
//       .then(products => {
//         console.log(products);
//         return products;
//       })
//       .catch(err => console.log(err));
//   };

//   static findOne = productId => {
//     const collection = getDb().collection("products");
//     return collection
//       .findOne({ _id: ObjectID(productId) })
//       .then(product => {
//         return product;
//       })
//       .catch(err => console.log(err));
//   };

//   static findMany = productsId => {
//     const collection = getDb().collection("products");
//     return collection
//       .find({ _id: { $in: productsId } })
//       .toArray()
//       .then(products => {
//         return products;
//       })
//       .catch(err => console.log(err));
//   };
// }

// module.exports = Product;

// // const Sequelize = require("sequelize");
// // const { Model } = Sequelize;
// // const sequelize = require("../util/database");

// // class Product extends Model {}
// // Product.init(
// //   {
// //     id: {
// //       type: Sequelize.INTEGER,
// //       autoIncrement: true,
// //       allowNull: false,
// //       primaryKey: true
// //     },
// //     title: {
// //       type: Sequelize.STRING,
// //       allowNull: false
// //     },
// //     price: {
// //       type: Sequelize.DOUBLE,
// //       allowNull: false
// //     },
// //     imageUrl: {
// //       type: Sequelize.STRING,
// //       allowNull: false
// //     },
// //     description: {
// //       type: Sequelize.STRING,
// //       allowNull: false
// //     }
// //   },
// //   {
// //     sequelize,
// //     modelName: "product"
// //   }
// // );

// // module.exports = Product;

// // const db = require("../util/database");
// // // const Cart = require("./cart");

// // module.exports = class Product {
// //   constructor(id, title, imageUrl, description, price) {
// //     this.id = id;
// //     this.title = title;
// //     this.imageUrl = imageUrl;
// //     this.description = description;
// //     this.price = price;
// //   }

// //   save() {
// //     const { title, price, description, imageUrl, id } = this;
// //     if (id) {
// //       console.log(this);
// //       return db.execute(
// //         "UPDATE products SET title=?, price=?, description=?, imageUrl=? WHERE id=?",
// //         [title, price, description, imageUrl, id]
// //       );
// //     } else {
// //       return db.execute(
// //         "INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?,?)",
// //         [title, price, description, imageUrl]
// //       );
// //     }
// //   }

// //   static deleteById(id) {
// //     return db.execute("DELETE FROM products WHERE id=?", [id]);
// //   }

// //   static fetchAll() {
// //     return db.execute("SELECT * FROM products");
// //   }

// //   static findById(id) {
// //     return db.execute("SELECT * FROM products WHERE id=?", [id]);
// //   }
// // };

// // const { getDb } = require("../util/database2");

// // class Product {
// //   constructor(title, price, description, imageUrl) {
// //     (this.title = title),
// //       (this.price = price),
// //       (this.description = description),
// //       (this.imageUrl = imageUrl);
// //   }

// //   save = async () => {
// //     console.log("saving..............................");
// //     const db = await getDb();
// //     db.collection("products").insertOne({
// //       name: "A book",
// //       price: 12.99
// //     });
// //   };
// // }

// // module.exports = Product;
