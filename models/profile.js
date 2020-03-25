const { ObjectID } = require("mongodb");
const { getDb } = require("../util/database2");

class Profile {
  constructor(name, email, cart) {
    this.name = name;
    this.email = email;
    this.cart = cart;
  }

  save() {
    const collection = getDb().collection("profiles");
    return collection.insertOne(this);
  }

  addToCart() {}

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
