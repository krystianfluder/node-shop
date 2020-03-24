const Sequelize = require("sequelize");
const { Model } = Sequelize;
const sequelize = require("../util/database");

class OrderItem extends Model {}
OrderItem.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    quantity: Sequelize.INTEGER
  },
  {
    sequelize,
    modelName: "order-item"
  }
);

module.exports = OrderItem;
