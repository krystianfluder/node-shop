require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const Profile = require("./models/profile");

const { mongoConnect } = require("./util/database2");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
// const profileRoutes = require("./routes/profile");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  Profile.findOne("5e7b1b556b68f612f2fb1fd7")
    .then(profile => {
      req.profile = new Profile(
        profile.name,
        profile.email,
        profile.cart,
        profile._id
      );
      next();
    })
    .catch(err => console.log(err));
});

app.use("/admin", adminRoutes);
// app.use("/profile", profileRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  app.listen(8080);
});

// Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
// User.hasMany(Product);
// User.hasOne(Cart);
// Cart.belongsTo(User);
// Cart.belongsToMany(Product, { through: CartItem });
// Product.belongsToMany(Cart, { through: CartItem });
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, { through: OrderItem });
// Product.belongsToMany(Order, { through: OrderItem });

// sequelize
//   // .sync({ force: true })
//   .sync()
//   .then(result => {
//     return User.findByPk(1);
//     // console.log(result);
//   })
//   .then(user => {
//     if (!user) {
//       return User.create({ name: "test", email: "test@test.com" });
//     }
//     return user;
//   })
//   .then(user => {
//     // console.log(user);
//     return user.createCart();
//   })
//   .then(cart => {
//     app.listen(8000);
//   })
//   .catch(err => {
//     console.log(err);
//   });
