const mongoose = require("mongoose");

const { Schema } = mongoose;

const profileSchema = Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: Boolean,
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
      items: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

profileSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
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
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;

  return this.save();
};

profileSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    console.log("itemmmmmmmmmmmmmm", item, productId);
    return item.productId.toString() !== productId.toString();
  });
  console.log(updatedCartItems);

  this.cart.items = updatedCartItems;
  return this.save();
};

profileSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

const Profile = mongoose.model("Profile", profileSchema);

module.exports = Profile;
