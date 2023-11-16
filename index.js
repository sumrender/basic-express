const express = require("express");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} => ${req.path}`);
  if(req.body) {
    console.log("------------------------------------------------------")
    console.log(req.body);
    console.log("------------------------------------------------------")
  }
  next();
})

app.get("/", (req, res) => {
  res.status(200).json({
    status: "app is working",
  });
});

app.post("/", (req, res) => {
  const body = req.body;
  const queries = req.query;
  
  if(queries.validationToken) {
    res.type('text/plain')
    return res.status(200).send(queries.validationToken);
  }

  res.status(200).json({
    ...(body ? { body, queries } : { body: "no body received" }),
  });
});

app.listen(3000, () => {
  console.log("server listening on port 3000");
});
