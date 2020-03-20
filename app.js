const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const db = require("./util/database");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// db.execute("SELECT * FROM products")
//   .then(result => {
//     console.log(result[0], result[1]);
//   })
//   .catch(err => {
//     console.log(err);
//   });

// db.execute("SELECT * FROM products", (err, rows) => {
//   if (err) {
//     return console.log(err);
//   }
//   console.log(rows[0]);
// });

// const getData = async () => {
//   const [rows, fields] = await db.query("SELECT * FROM products");
//   console.log(rows);
// };

// getData();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(8080);
