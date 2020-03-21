const { getDb } = require("../util/database2");

class Product {
  constructor(title, price, description, imageUrl) {
    (this.title = title),
      (this.price = price),
      (this.description = description),
      (this.imageUrl = imageUrl);
  }

  save = async () => {
    console.log("saving..............................");
    const db = await getDb();
    db.collection("products").insertOne({
      name: "A book",
      price: 12.99
    });
  };
}

module.exports = Product;

// const Sequelize = require("sequelize");
// const { Model } = Sequelize;
// const sequelize = require("../util/database");

// class Product extends Model {}
// Product.init(
//   {
//     id: {
//       type: Sequelize.INTEGER,
//       autoIncrement: true,
//       allowNull: false,
//       primaryKey: true
//     },
//     title: {
//       type: Sequelize.STRING,
//       allowNull: false
//     },
//     price: {
//       type: Sequelize.DOUBLE,
//       allowNull: false
//     },
//     imageUrl: {
//       type: Sequelize.STRING,
//       allowNull: false
//     },
//     description: {
//       type: Sequelize.STRING,
//       allowNull: false
//     }
//   },
//   {
//     sequelize,
//     modelName: "product"
//   }
// );

// module.exports = Product;

// const db = require("../util/database");
// // const Cart = require("./cart");

// module.exports = class Product {
//   constructor(id, title, imageUrl, description, price) {
//     this.id = id;
//     this.title = title;
//     this.imageUrl = imageUrl;
//     this.description = description;
//     this.price = price;
//   }

//   save() {
//     const { title, price, description, imageUrl, id } = this;
//     if (id) {
//       console.log(this);
//       return db.execute(
//         "UPDATE products SET title=?, price=?, description=?, imageUrl=? WHERE id=?",
//         [title, price, description, imageUrl, id]
//       );
//     } else {
//       return db.execute(
//         "INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?,?)",
//         [title, price, description, imageUrl]
//       );
//     }
//   }

//   static deleteById(id) {
//     return db.execute("DELETE FROM products WHERE id=?", [id]);
//   }

//   static fetchAll() {
//     return db.execute("SELECT * FROM products");
//   }

//   static findById(id) {
//     return db.execute("SELECT * FROM products WHERE id=?", [id]);
//   }
// };
