const db = require("../util/database");
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
        "UPDATE products SET title=?, price=?, description=?, imageUrl=? WHERE id=?",
        [title, price, description, imageUrl, id]
      );
    } else {
      return db.execute(
        "INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?,?)",
        [title, price, description, imageUrl]
      );
    }
  }

  static deleteById(id) {
    return db.execute("DELETE FROM products WHERE id=?", [id]);
  }

  static fetchAll() {
    return db.execute("SELECT * FROM products");
  }

  static findById(id) {
    return db.execute("SELECT * FROM products WHERE id=?", [id]);
  }
};
