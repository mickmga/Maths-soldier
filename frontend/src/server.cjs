"use strict";
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files from the 'public' directory

// Route to serve HTML files based on the requested path
app.get("/:path", (req, res) => {
  const requestedPath = req.params.path;
  const filePath = path.join(__dirname, "../public", `${requestedPath}.html`);
  console.log(filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("Page not found");
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
try {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (e) {
  console.log(e);
}
