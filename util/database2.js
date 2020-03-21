const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

let _db;

const mongoConnect = callback => {
  MongoClient.connect(url)
    .then(client => {
      console.log("Connected!");
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = async () => {
  await _db;
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
