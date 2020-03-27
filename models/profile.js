const mongoose = require("mongoose");

const { Schema } = mongoose;

const profileSchema = Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  }
});

profileSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems
  };

  this.cart = updatedCart;

  return this.save();
};

profileSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

profileSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
// const collection = getDb().collection("profiles");
// collection.updateOne(
//   {
//     _id: ObjectID(this._id)
//   },
//   {
//     $set: {
//       cart: updatedCart
//     }
//   }
// );

//   deleteFromCart(productId) {
//     const collection = getDb().collection("profiles");
//     const updatedCartItems = this.cart.items.filter(
//       item => item.productId.toString() !== productId.toString()
//     );
//     console.log(updatedCartItems);
//     return collection.updateOne(
//       {
//         _id: ObjectID(this._id)
//       },
//       {
//         $set: {
//           cart: { items: updatedCartItems }
//         }
//       }
//     );
//   }

//   getCart() {
//     const collection = getDb().collection("products");
//     const productsId = this.cart.items.map(item => {
//       return item.productId;
//     });
//     return collection
//       .find({ _id: { $in: productsId } })
//       .toArray()
//       .then(products => {
//         return products.map(product => {
//           return {
//             ...product,
//             quantity: this.cart.items.find(item => {
//               return item.productId.toString() === product._id.toString();
//             }).quantity
//           };
//         });
//       });
//   }

// const { ObjectID } = require("mongodb");
// const { getDb } = require("../util/database2");

// class Profile {
//   constructor(name, email, cart, id) {
//     this.name = name;
//     this.email = email;
//     this.cart = cart; // {items: {}}
//     this._id = id;
//   }

//   save() {
//     const collection = getDb().collection("profiles");
//     return collection.insertOne(this);
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex(cp => {
//       return cp.productId.toString() === product._id.toString();
//     });
//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: ObjectID(product._id),
//         quantity: newQuantity
//       });
//     }
//     const updatedCart = {
//       items: updatedCartItems
//     };

//     const collection = getDb().collection("profiles");
//     collection.updateOne(
//       {
//         _id: ObjectID(this._id)
//       },
//       {
//         $set: {
//           cart: updatedCart
//         }
//       }
//     );
//   }

//   addOrder() {
//     const db = getDb();
//     return this.getCart()
//       .then(products => {
//         const order = {
//           items: products,
//           profile: {
//             _id: new ObjectID(this._id),
//             name: this.name,
//             email: this.email
//           },
//           createdAt: new Date()
//         };
//         db.collection("orders").insertOne(order);
//       })
//       .then(() => {
//         this.cart = { items: [] };
//         return db
//           .collection("profiles")
//           .updateOne(
//             { _id: ObjectID(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       })
//       .then(result => result)
//       .catch(err => console.log(err));
//   }

//   getOrders() {
//     const collection = getDb().collection("orders");
//     return collection
//       .find({ "profile._id": ObjectID(this._id) })
//       .toArray()
//       .then(orders => {
//         return orders;
//       })
//       .catch(err => console.log(err));
//   }

//   static findOne(id) {
//     const collection = getDb().collection("profiles");
//     return collection
//       .findOne({ _id: ObjectID(id) })
//       .then(result => {
//         return result;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static findAll() {
//     const collection = getDb().collection("profiles");
//     return collection.find().toArray();
//   }
// }

// module.exports = Profile;

// // const Sequelize = require("sequelize");
// // const { Model } = Sequelize;
// // const sequelize = require("../util/database");

// // class User extends Model {}

// // User.init(
// //   {
// //     id: {
// //       type: Sequelize.INTEGER,
// //       autoIncrement: true,
// //       allowNull: false,
// //       primaryKey: true
// //     },
// //     name: {
// //       type: Sequelize.STRING,
// //       allowNull: false
// //     },
// //     email: {
// //       type: Sequelize.STRING,
// //       allowNull: false
// //     }
// //   },
// //   {
// //     sequelize,
// //     modelName: "user"
// //   }
// // );

// // module.exports = User;
