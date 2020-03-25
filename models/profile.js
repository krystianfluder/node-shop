const { ObjectID } = require("mongodb");
const { getDb } = require("../util/database2");

class Profile {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart; // {items: {}}
    this._id = id;
  }

  save() {
    const collection = getDb().collection("profiles");
    return collection.insertOne(this);
  }

  addToCart(product) {
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
        productId: ObjectID(product._id),
        quantity: newQuantity
      });
    }
    const updatedCart = {
      items: updatedCartItems
    };

    const collection = getDb().collection("profiles");
    collection.updateOne(
      {
        _id: ObjectID(this._id)
      },
      {
        $set: {
          cart: updatedCart
        }
      }
    );
  }

  // static fetchCart(id) {
  //   const collection = getDb().collection("profiles");
  //   return collection.findOne({
  //     _id: ObjectID(id)
  //   });
  // }

  static findOne(id) {
    const collection = getDb().collection("profiles");
    return collection
      .findOne({ _id: ObjectID(id) })
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err);
      });
  }

  static findAll() {
    const collection = getDb().collection("profiles");
    return collection.find().toArray();
  }
}

module.exports = Profile;

// const Sequelize = require("sequelize");
// const { Model } = Sequelize;
// const sequelize = require("../util/database");

// class User extends Model {}

// User.init(
//   {
//     id: {
//       type: Sequelize.INTEGER,
//       autoIncrement: true,
//       allowNull: false,
//       primaryKey: true
//     },
//     name: {
//       type: Sequelize.STRING,
//       allowNull: false
//     },
//     email: {
//       type: Sequelize.STRING,
//       allowNull: false
//     }
//   },
//   {
//     sequelize,
//     modelName: "user"
//   }
// );

// module.exports = User;