import { build } from "esbuild";
import path from "path";

build({
  entryPoints: [path.join("src", "palace.ts")],
  bundle: true,
  minify: false,
  sourcemap: true,
  outfile: path.join("public", "dist", "palace.js"),
  target: ["es6"],
  platform: "browser",
  loader: {
    ".png": "file",
    ".css": "file",
  },
}).catch(() => process.exit(1));
