import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const TEMPLATES_DIR = join(__dirname, "templates");

if (!existsSync(TEMPLATES_DIR)) mkdirSync(TEMPLATES_DIR);

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function saveTemplate(template, description) {
  const code = genCode();
  const data = { code, description, template, createdAt: new Date().toISOString() };
  writeFileSync(join(TEMPLATES_DIR, `${code}.json`), JSON.stringify(data, null, 2));
  return code;
}

export function loadTemplate(code) {
  const file = join(TEMPLATES_DIR, `${code.toUpperCase()}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

export function deleteTemplate(code) {
  if (code.toUpperCase() === "ALL") {
    if (!existsSync(TEMPLATES_DIR)) return 0;
    const files = readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".json"));
    for (const f of files) unlinkSync(join(TEMPLATES_DIR, f));
    return files.length;
  }
  const file = join(TEMPLATES_DIR, `${code.toUpperCase()}.json`);
  if (!existsSync(file)) return false;
  unlinkSync(file);
  return true;
}

export function listTemplates() {
  if (!existsSync(TEMPLATES_DIR)) return [];
  return readdirSync(TEMPLATES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(TEMPLATES_DIR, f), "utf8")))
    .map(({ code, description, createdAt }) => ({ code, description, createdAt }));
}
