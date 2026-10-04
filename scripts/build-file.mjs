import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const distDir = "dist";
const fileDistDir = "dist-file";
const html = await readFile(join(distDir, "vite.html"), "utf8");
const scriptMatch = html.match(/<script type="module" crossorigin src="(?<src>[^"]+)"><\/script>/);
const styleMatch = html.match(/<link rel="stylesheet" crossorigin href="(?<href>[^"]+)">/);

if (!scriptMatch?.groups?.src || !styleMatch?.groups?.href) {
  throw new Error("Could not find Vite build assets to inline.");
}

const scriptPath = join(distDir, scriptMatch.groups.src.replace(/^\.\//, ""));
const stylePath = join(distDir, styleMatch.groups.href.replace(/^\.\//, ""));
const [script, style] = await Promise.all([readFile(scriptPath, "utf8"), readFile(stylePath, "utf8")]);

const fileHtml = html
  .replace(styleMatch[0], `<style>\n${style}\n</style>`)
  .replace(scriptMatch[0], "")
  .replace("</body>", `    <script>\n${script}\n    </script>\n  </body>`)
  .replace(/[ \t]+$/gm, "");

const fileOutputPath = join(fileDistDir, "index.html");
await mkdir(dirname(fileOutputPath), { recursive: true });
await writeFile(fileOutputPath, fileHtml);
await writeFile("index.html", fileHtml);
