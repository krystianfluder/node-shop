require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");

const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");

// const { mongoConnect } = require("./util/database2");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE"
});

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    return User.findByPk(1);
    // app.listen(3000);
  })
  .then(user => {
    if (!user) {
      User.create({ name: "test", email: "test@test.com" });
    }
    return user;
  })
  .then(user => {
    // console.log(user);
    app.listen(8080);
  })
  .catch(err => {
    console.log(err);
  });
