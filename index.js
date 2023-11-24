const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const parseEmail = require("./parseEmails")
require("dotenv").config();

const app = express();
app.use(express.json());

const accessToken = process.env.ACCESS_TOKEN;
if (!accessToken) {
  console.log("accessToken not found");
}

async function getEmailById(id) {
  const apiUrl = `https://graph.microsoft.com/v1.0/me/messages/${id}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching email::::::::::::::::::", error);
  }
}

const idSet = new Set();

function idExistsInSet(id) {
  if (idSet.has(id)) {
    console.log(`ID already exists in the set.`);
    console.log(id);
    return true;
  } else {
    idSet.add(id);
    console.log(`ID added to the set.`);
    console.log(id);
    return false;
  }
}

// ------------------ Mongoose ----------------------
const itemSchema = new mongoose.Schema({}, { strict: false });
const Item = mongoose.model("Item", itemSchema);

app.use((req, res, next) => {
  console.log(`${req.method} => ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "app is working",
  });
});

app.post("/", async (req, res) => {
  try {
    const body = req.body;
    const queries = req.query;

    if (queries.validationToken) {
      res.type("text/plain");
      return res.status(200).send(queries.validationToken);
    }

    if (body && body.value && body.value.length > 0) {
      const notification = body.value[0];
      const emailId = notification.resourceData.id;
      if (idExistsInSet(emailId)) {
        return res.status(200);
      }

      // fetch email by id
      const email = await getEmailById(emailId);
      if(!email) { // this is because sometimes graph sends 404 error
        idSet.delete(emailId);
        console.log("id deleted bcz email not found");
        return res.status(200);
      }

      // parse the email to extract ticketId, sender and message
      const parsedEmail = parseEmail(email, "sumrenders@outlook.com");
      // need to pass outlook email id, because outlook sends message in a different format
      const item = await Item.create(parsedEmail);
      console.log("email added to database");
    }

    res.status(200);
  } catch (error) {
    console.log("error in post request", error);
    res.status(200);
  }
});

const port = 4000;
const uri = process.env.DB_URL || `mongodb://127.0.0.1:27017/support-test`;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri)
  .then((db) => {
    // listen for requests
    app.listen(port, () => {
      console.log(
        `connected to db ${db.connection.host} & listening on port`,
        port
      );
    });
  })
  .catch((error) => {
    console.log(error);
  });
