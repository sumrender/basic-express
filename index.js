const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// ------------------ Mongoose ----------------------
const itemSchema = new mongoose.Schema({}, { strict: false });
const Item = mongoose.model("Item", itemSchema);

app.use((req, res, next) => {
  console.log(`${req.method} => ${req.path}`);
  next();
})

app.get("/", (req, res) => {
  res.status(200).json({
    status: "app is working",
  });
});

app.post("/", async (req, res) => {
  const body = req.body;
  const queries = req.query;
  
  if(queries.validationToken) {
    res.type('text/plain')
    return res.status(200).send(queries.validationToken);
  }

  let notification = {"data": "received no body"};
  if(body) {
    notification = await Item.create(body);
  }

  res.status(200).json(notification);
});

const port = 3000;
const uri = process.env.DB_URL || `mongodb://127.0.0.1:27017/support-test`

mongoose.set("strictQuery", false);
mongoose.connect(uri)
  .then((db) => {
    // listen for requests
    app.listen(port, () => {
      console.log(`connected to db ${db.connection.host} & listening on port`, port)
    })
  })
  .catch((error) => {
    console.log(error)
  })