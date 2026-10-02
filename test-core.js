import assert from "node:assert";
import { saveTemplate, loadTemplate, listTemplates, deleteTemplate } from "./store.js";
import { botsEmbed, companionBotEmbed, companionBotActionRow, carlBotGuideEmbed } from "./bots.js";

console.log("🧪 Running core unit tests...");

// 1. Store Test
const testTemplate = {
  roles: [{ name: "Test Role", color: "#ff0000" }],
  categories: [{ name: "Test Cat", access: "public", channels: [{ name: "test-ch" }] }],
};

const code = saveTemplate(testTemplate, "Unit Test Template");
assert.ok(code && typeof code === "string" && code.length === 6, "Code should be 6 characters");

const loaded = loadTemplate(code);
assert.strictEqual(loaded.code, code, "Loaded template code must match");
assert.strictEqual(loaded.description, "Unit Test Template");
assert.strictEqual(loaded.template.roles[0].name, "Test Role");

// Null / invalid code tests (must return null, not throw)
assert.strictEqual(loadTemplate(null), null);
assert.strictEqual(loadTemplate(undefined), null);
assert.strictEqual(loadTemplate("NON_EXISTENT_9999"), null);
assert.strictEqual(deleteTemplate(null), false);

// List templates
const list = listTemplates();
assert.ok(list.some((t) => t.code === code), "Newly saved template must appear in list");

// Delete template
const deleted = deleteTemplate(code);
assert.strictEqual(deleted, true, "Delete should return true");
assert.strictEqual(loadTemplate(code), null, "Deleted template should not be loadable");

console.log("✅ Store tests passed!");

// 2. Bots Embed Tests
const bEmbed = botsEmbed();
assert.ok(bEmbed.data.title.includes("Recommended"), "Bots embed title match");

const cEmbed = companionBotEmbed("Mahasiswa");
assert.ok(cEmbed.data.title.includes("Bot Pendamping"), "Companion embed title match");
assert.ok(cEmbed.data.fields[0].value.includes("Mahasiswa"), "Companion embed mentions verified role");

const guide = carlBotGuideEmbed();
assert.ok(guide.data.title.includes("Panduan Setup"), "Guide embed title match");

const actRow = companionBotActionRow();
assert.strictEqual(actRow.components.length, 4, "Action row must have 4 buttons");

console.log("✅ Embed & UI tests passed!");

// 3. Helper color parser simulation
function parseColor(c) {
  if (!c) return 0;
  if (typeof c === "number") return c;
  if (typeof c === "string") return parseInt(c.replace("#", ""), 16) || 0;
  return 0;
}

assert.strictEqual(parseColor("#ffffff"), 16777215);
assert.strictEqual(parseColor("#000000"), 0);
assert.strictEqual(parseColor(12345), 12345);
assert.strictEqual(parseColor(null), 0);

console.log("✅ Helper function tests passed!");
console.log("🎉 All unit tests successfully passed!");
