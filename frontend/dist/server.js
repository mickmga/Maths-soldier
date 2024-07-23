import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "../public")));

// Endpoint to list all files in the assets directory
app.get("/assets-list", (req, res) => {
  const assetsDirectory = path.join(__dirname, "../public/assets");

  fs.readdir(assetsDirectory, (err, files) => {
    if (err) {
      return res.status(500).send("Unable to scan directory: " + err);
    }
    res.json(files);
  });
});

// Route to serve HTML files based on the requested path
app.get("/:path", (req, res) => {
  const requestedPath = req.params.path;
  const filePath = path.join(__dirname, "../public", `${requestedPath}.html`);
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
