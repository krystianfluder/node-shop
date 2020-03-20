const db = require("../util/database");
const SqlString = require("sqlstring");
// const Cart = require("./cart");

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    const { title, price, description, imageUrl, id } = this;
    if (id) {
      console.log(this);
      return db.execute(
        `UPDATE products SET title=${SqlString.escape(
          title
        )}, price=${SqlString.escape(price)}, description=${SqlString.escape(
          description
        )}, imageUrl=${SqlString.escape(imageUrl)} WHERE id=${SqlString.escape(
          id
        )}`
      );
    } else {
      return db.execute(
        `INSERT INTO products (title, price, description, imageUrl) VALUES (${SqlString.escape(
          title
        )}, ${SqlString.escape(price)}, ${SqlString.escape(
          description
        )}, ${SqlString.escape(imageUrl)});`
      );
    }
  }

  static deleteById(id) {
    return db.execute(`DELETE FROM products WHERE id=${SqlString.escape(id)}`);
  }

  static fetchAll() {
    return db.execute("SELECT * FROM products");
  }

  static findById(id) {
    return db.execute(
      `SELECT * FROM products WHERE id=${SqlString.escape(id)}`
    );
  }
};
