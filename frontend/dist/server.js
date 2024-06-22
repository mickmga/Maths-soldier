import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files from the 'public' directory
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
}
catch (e) {
    console.log(e);
}
