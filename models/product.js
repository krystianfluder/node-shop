const mongoose = require("mongoose");

const { Schema } = mongoose;

const productSchema = Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imageUrlSmall: {
      type: String,
      required: true,
    },
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
