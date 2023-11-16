const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "app is working",
  });
});

app.post("/", (req, res) => {
  const body = req.body;

  res.status(200).json({
    ...(body ? body : { body: "no body received" }),
  });
});

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
