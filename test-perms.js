import { PermissionFlagsBits } from "discord.js";
import assert from "node:assert";
import { carlBotGuideEmbed, companionBotActionRow } from "./bots.js";

// Test 1: Self-role category matching
const catName = "╠═══ 🏛️ KELAS IF - 2 - KA ═══╣";
const catNameClean = catName.toLowerCase().replace(/[^a-z0-9]/g, "");
const srRoles = [
  { name: "🏷️ IF-2-KA", id: "101" },
  { name: "🏷️ IF-2-KM", id: "102" },
];

let matched = null;
for (const sr of srRoles) {
  const roleNameClean = sr.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (roleNameClean.length >= 3 && catNameClean.includes(roleNameClean)) {
    matched = sr;
    break;
  }
}
assert.strictEqual(matched?.id, "101", "Category matching should find IF-2-KA");
console.log("✅ Category matching test passed: matched", matched.name);

// Test 2: Verify carlBotGuideEmbed has required sections
const guide = carlBotGuideEmbed();
assert.ok(guide.data.title.includes("Panduan Lengkap"), "Guide title exists");
assert.strictEqual(guide.data.fields.length, 5, "Guide should have 5 fields");
console.log("✅ Guide embed test passed with 5 detailed steps");

// Test 3: Verify companion action row has 4 buttons
const row = companionBotActionRow();
assert.strictEqual(row.components.length, 4, "Row should have 4 buttons");
console.log("✅ Companion action row test passed with 4 buttons");
