// Docling warm-up conversion for lesson 0 of the workshop (`npm run docling:warmup`).
//
// Starts docling-mcp-server over stdio with the same configuration Copilot will use
// in lesson 6, converts calentamiento.pdf (downloading the layout, table and OCR models
// on the first run) and checks that OCR reads the control word on the scanned page.
//
// It speaks MCP (newline-delimited JSON-RPC) directly, so it needs no dependencies.

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SERVER = "docling-mcp-server";
const SERVER_ARGS = ["--transport", "stdio", "conversion", "manipulation"];
const PDF = join(dirname(fileURLToPath(import.meta.url)), "calentamiento.pdf");
// Must match SCAN_LINES in docs/assets/generate-warmup-pdf.py of the workshop repo.
const CONTROL_WORD = "Giralda";
const LOG_LINES = 30;

const log = [];
const pending = new Map();
let nextId = 1;
let started = Date.now();

const seconds = () => `${Math.round((Date.now() - started) / 1000)} s`;

function fail(message) {
  console.error(`\n❌ ${message}`);
  if (log.length > 0) {
    console.error(`\nÚltimas líneas del log de docling-mcp-server:\n`);
    console.error(log.join("\n"));
  }
  server.kill();
  process.exit(1);
}

const server = spawn(SERVER, SERVER_ARGS, {
  // COLUMNS widens the server's log, which otherwise wraps at 80 characters.
  env: { ...process.env, DOCLING_MCP_CONVERSION_MODE: "local", COLUMNS: "160" },
  stdio: ["pipe", "pipe", "pipe"],
});

server.on("error", (err) => {
  if (err.code === "ENOENT") {
    fail(
      `No se encuentra ${SERVER}. Instálalo con \`uv tool install "docling-mcp[local]==3.3.0"\`, ` +
        "ejecuta `uv tool update-shell` y abre una terminal nueva.",
    );
  }
  fail(`No se pudo arrancar ${SERVER}: ${err.message}`);
});

server.on("exit", (code) => {
  for (const { reject } of pending.values()) {
    reject(new Error(`${SERVER} se ha cerrado inesperadamente (código ${code}).`));
  }
});

createInterface({ input: server.stderr }).on("line", (line) => {
  log.push(line);
  if (log.length > LOG_LINES) log.shift();
});

createInterface({ input: server.stdout }).on("line", (line) => {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return; // Not JSON-RPC: ignore stray output.
  }
  const call = pending.get(msg.id);
  if (!call) return;
  pending.delete(msg.id);
  if (msg.error) call.reject(new Error(msg.error.message));
  else call.resolve(msg.result);
});

function send(message) {
  server.stdin.write(JSON.stringify({ jsonrpc: "2.0", ...message }) + "\n");
}

function request(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    send({ id, method, params });
  });
}

async function callTool(name, args) {
  const result = await request("tools/call", { name, arguments: args });
  const text = (result.content ?? []).map((c) => c.text ?? "").join("\n");
  if (result.isError) throw new Error(text || `La herramienta ${name} ha fallado.`);
  return { structured: result.structuredContent, text };
}

try {
  await request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "docling-warmup", version: "1.0.0" },
  });
  send({ method: "notifications/initialized" });
  console.log(`✔ ${SERVER} arrancado (${seconds()})`);

  console.log(
    "⏳ Convirtiendo calentamiento.pdf. La primera vez descarga ~510 MB de modelos y puede tardar varios minutos...",
  );
  started = Date.now();
  const conversion = await callTool("convert_document_into_docling_document", { source: PDF });
  const documentKey = conversion.structured?.document_key ?? JSON.parse(conversion.text).document_key;
  console.log(`✔ PDF convertido (${seconds()})`);

  const search = await callTool("search_for_text_in_document_anchors", {
    document_key: documentKey,
    text: CONTROL_WORD,
  });
  // The "not found" message also echoes the search text, so look for exact matches instead.
  const result = search.structured?.result ?? search.text;
  if (!result.includes("Found exact text matches")) {
    fail(`El OCR no ha encontrado la palabra de control «${CONTROL_WORD}» en la página escaneada.`);
  }
  console.log(`✔ OCR de la página escaneada: «${CONTROL_WORD}» encontrada`);

  console.log(`\n✅ Docling está listo. document_key: ${documentKey}`);
  server.kill();
} catch (err) {
  fail(err.message);
}
