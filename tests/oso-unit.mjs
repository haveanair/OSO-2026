/* Standalone OSO translation / installability regression checks: node tests/oso-unit.mjs */
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const html = read("play/index.html");
const match = html.match(/const GAMES=(\[[^\r\n]+\]);/);
assert.ok(match, "The ten official game records must be present");
const games = JSON.parse(match[1]);
assert.equal(games.length, 10, "The release keeps the original ten games");

const noop = () => {};
const win = { dispatchEvent: noop, addEventListener: noop };
const memory = new Map();
const doc = {
  readyState: "loading",
  addEventListener: noop,
  createElement: () => ({}),
  head: { appendChild: noop },
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  documentElement: {}
};
const sandbox = {
  window: win,
  document: doc,
  navigator: { language: "en-US" },
  localStorage: {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value)
  },
  MutationObserver: class { observe() {} },
  Node: { TEXT_NODE: 3, ELEMENT_NODE: 1 },
  CustomEvent: class { constructor(name, options) { this.type = name; this.detail = options?.detail; } },
  requestAnimationFrame: noop,
  console
};
vm.createContext(sandbox);
vm.runInContext(read("play/oso-i18n.js"), sandbox, { timeout: 1500 });
vm.runInContext(read("play/oso-game-i18n.js"), sandbox, { timeout: 1500 });
assert.equal(win.OSO_I18N.getLanguage(), "en");
for (const game of games) {
  for (const key of ["name", "desc", "area"]) {
    const tr = win.OSO_I18N.t(game[key]);
    assert.notEqual(tr, game[key], `Missing English game ${game.code} ${key}`);
  }
}
const examples = [
  ["🎉 클리어!", "🎉 Stage Clear!"],
  ["💥 GAME OVER · 🏆 신기록!", "💥 GAME OVER · 🏆 New Record!"],
  ["🪙 +150 (기본 100 + 장바구니 획득 50) · 현재 보유 1,250",
   "🪙 +150 (Base 100 + Basket Bonus 50) · Balance 1,250"],
  ["🏆 누적점수 12,345점", "🏆 Total Score 12,345 pts"],
  ["15 연타", "15 taps"],
  ["10 / 15 단", "10 / 15 layers"],
  ["속도 ×1.25", "Speed ×1.25"],
  ["나가기", "Exit"]
];
for (const [ko, en] of examples) {
  assert.equal(win.OSO_GAME_I18N.translate(ko), en, `Wrong translation for ${ko}`);
}
win.OSO_I18N.setLanguage("ko");
assert.equal(win.OSO_I18N.getLanguage(), "ko");
win.OSO_I18N.setLanguage("en");
assert.equal(win.OSO_I18N.getLanguage(), "en");
assert.equal(memory.get("oso.language.v1"), "en");
assert.ok(html.includes('src="./oso-game-i18n.js'), "Game translator must load");
assert.ok(html.includes('rel="manifest"'), "Game must link install manifest");
assert.ok(html.includes('href="./oso-i18n.css'), "English layout stylesheet must load");
assert.ok(html.includes('register("./sw.js"'), "Service worker must register");

const manifest = JSON.parse(read("play/manifest.webmanifest"));
assert.equal(manifest.scope, "./");
assert.equal(manifest.display, "standalone");
const expected = new Map([
  ["play/icons/oso-192.png", 192],
  ["play/icons/oso-512.png", 512],
  ["play/icons/oso-maskable-512.png", 512]
]);
for (const [file, size] of expected) {
  const bytes = fs.readFileSync(path.join(root, file));
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `Invalid PNG ${file}`);
  assert.equal(bytes.readUInt32BE(16), size, `Width mismatch ${file}`);
  assert.equal(bytes.readUInt32BE(20), size, `Height mismatch ${file}`);
}
assert.equal(manifest.icons.filter(i => i.type === "image/png").length, 3);
console.log("OSO unit regression checks: PASS (10 games bilingual, result strings, PWA icons, bootstrap)");
