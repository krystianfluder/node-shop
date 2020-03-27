const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    products: [
      {
        product: {
          type: Object,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ],
    profile: {
      profileId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Profile"
      }
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
