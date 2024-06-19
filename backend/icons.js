const https = require("https");
const cors = require("cors");
const compression = require("compression");

const app = require("express")();

// Use the cors and compression middleware
app.use(cors());
app.use(compression());
app.get("/iconfinder", (request, response) => {
  const query = request.query.query;
  if (!query) {
    response.status(400).send("Query parameter is required");
    return;
  }

  const options = {
    method: "GET",
    hostname: "api.iconfinder.com",
    port: 443,
    path: `/v4/icons/search?query=${query}&count=20`,
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer uOYEohnWqwtTPG4s6dkh8MNUlQYCpgqzA4O6hJmpcXcVJk4D7ogC7chxdN0hgSlH",
    },
    agent: new https.Agent({ keepAlive: true }),
  };

  const req = https.request(options, function (res) {
    const chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      const body = Buffer.concat(chunks);
      response.setHeader("Content-Type", "application/json");
      response.send(body.toString());
    });
  });

  req.on("error", (e) => {
    console.error(`Problem with request: ${e.message}`);
    response.status(500).send("Error with HTTPS request");
  });

  req.end();
});

app.listen(3000, () => console.log("app running"));
