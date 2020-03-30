require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const errorController = require("./controllers/error");
const Profile = require("./models/profile");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "session",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

app.use((req, res, next) => {
  if (req.session.isLoggedIn) {
    Profile.findById(req.session.profile._id)
      .then(profile => {
        req.profile = profile;
        next();
      })
      .catch(err => console.log(err));
  } else {
    next();
  }
});

// app.use((req, res, next) => {
//   // console.log(req.profile);
//   next();
// });

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => {
    // const profile = new Profile({
    //   name: "test",
    //   email: "test@test.com",
    //   cart: {
    //     items: []
    //   }
    // });
    // profile.save();

    app.listen(8080);
  })
  .catch(err => console.log(err));
