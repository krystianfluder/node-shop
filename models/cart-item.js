const Sequelize = require("sequelize");
const { Model } = Sequelize;
const sequelize = require("../util/database");

class CartItem extends Model {}
CartItem.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "cartitem"
  }
);

module.exports = CartItem;
