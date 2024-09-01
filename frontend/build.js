import { build } from "esbuild";
import path from "path";

build({
  entryPoints: [
    path.join("src", "palace.ts"),
    path.join("src", "notebook.ts"),
    path.join("src", "challenge.ts"),
    path.join("src", "challenge_guardians.ts"),
    path.join("src", "discovery.ts"),
    path.join("src", "boss.ts"),
    path.join("src", "load.ts"),
  ],
  bundle: true,
  minify: false,
  sourcemap: true,
  outdir: path.join("public", "dist"),
  target: ["es6"],
  platform: "browser",
  loader: {
    ".png": "file",
    ".css": "file",
  },
}).catch(() => process.exit(1));
