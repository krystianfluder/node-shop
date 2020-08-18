require("dotenv").config();
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);
const fs = require("fs");
const path = require("path");
// const https = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const errorController = require("./controllers/error");
const Profile = require("./models/profile");

const csrfProtection = csrf();

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const v1Routes = require("./routes/v1");
const { getBreadcrumbs } = require("./util/breadcrumbs");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  }
);

app.use(helmet());
app.use(compression());
app.use(
  morgan("combined", {
    stream: accessLogStream,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));
app.use("/images", express.static("images"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "session",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// for improvment

// without csrf
app.use("/v1", v1Routes);

app.use(csrfProtection);
app.use(flash());

// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

app.use((req, res, next) => {
  res.locals.path = req.url;
  res.locals.breadcrumbs = getBreadcrumbs(req.url);
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.profile) {
    return next();
  }
  Profile.findById(req.session.profile._id)
    .then((profile) => {
      if (!profile) {
        return next();
      }
      req.profile = profile;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  const status = error.status ? error.status : 500;

  res.status(status).render("error", {
    pageTitle: "Error",
    path: "/error",
    message: error.message,
    status: status,
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: req.session.isAdmin,
    csrfToken: req.csrfToken(),
  });
});

mongoose
  .connect(process.env.MONGO_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(8080);
    // https
    //   .createServer(
    //     {
    //       key: privateKey,
    //       cert: certificate,
    //     },
    //     app
    //   )
    //   .listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
