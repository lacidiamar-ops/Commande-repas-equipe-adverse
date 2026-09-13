import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const host = option("host", "0.0.0.0");
const port = Number(option("port", "4173"));
const root = resolve(process.cwd());
const mime = {
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".webmanifest":"application/manifest+json; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".webp":"image/webp",
  ".svg":"image/svg+xml"
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://local").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    let file = normalize(join(root, relative));
    if (!file.startsWith(root)) throw new Error("Chemin interdit");
    const details = await stat(file);
    if (details.isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    response.writeHead(200, {
      "content-type":mime[extname(file).toLowerCase()] || "application/octet-stream",
      "cache-control":"no-store"
    });
    response.end(body);
  } catch (_error) {
    response.writeHead(404, { "content-type":"text/plain; charset=utf-8" });
    response.end("Introuvable");
  }
}).listen(port, host, () => {
  process.stdout.write(`Commande repas disponible sur http://${host}:${port}\n`);
});
