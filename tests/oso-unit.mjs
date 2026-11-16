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
vm.runInContext(read("play/oso-rpg-strings.js"), sandbox, { timeout: 1500 });
vm.runInContext(read("play/oso-rpg-dynamic.js"), sandbox, { timeout: 1500 });
vm.runInContext(read("play/oso-game-i18n.js"), sandbox, { timeout: 1500 });
assert.equal(win.OSO_I18N.getLanguage(), "en");

function rpgStaticText(html) {
  const start = html.indexOf("function playOsoFantasy(){");
  const end = html.indexOf("</script>", start);
  assert.ok(start >= 0 && end > start, "RPG source block must be present");
  const text = html.slice(start, end);
  let quote = null, buffer = "", escaped = false;
  const phrases = new Set();
  for (const char of text) {
    if (!quote) {
      if (char === "'" || char === '"' || char === "`") {
        quote = char; buffer = ""; escaped = false;
      }
      continue;
    }
    if (escaped) { buffer += char; escaped = false; continue; }
    if (char === "\\") { escaped = true; continue; }
    if (char === quote) {
      if (/[가-힣]/.test(buffer) && buffer.length < 240 && buffer.length > 5
          && !buffer.includes("<") && !buffer.includes("}")
          && !buffer.includes("return ") && !buffer.includes("function ")) phrases.add(buffer);
      quote = null; continue;
    }
    buffer += char;
  }
  return [...phrases];
}
const rpgLines = rpgStaticText(html);
assert.ok(rpgLines.length >= 145, "RPG static-phrase audit has unexpectedly low coverage");
const untranslatedRpg = rpgLines.filter(line => win.OSO_GAME_I18N.translate(line) === line);
assert.deepEqual(untranslatedRpg, [], "Untranslated fixed RPG phrases must be added to the English dictionary");

assert.ok(Object.keys(win.OSO_RPG_STRINGS).length >= 140, "RPG dialogue dictionary should be complete enough for this phase");
assert.ok(win.OSO_GAME_I18N.dictionarySize >= 240, "Stage translator must merge RPG dialogue dictionary");
for (const [ko, en] of [
  ["시장 원로", "Market Elder"],
  ["마왕 흑우령", "Demon King Heuk-u-ryeong"],
  ["지하창고부터 차근차근 살펴보게. 서두르지 않아도 길은 하나씩 열리네.",
   "Start with the basement warehouse. Take your time; one path will open after another."],
  ["황금장바구니방패가 공격을 막았다!", "The Golden Basket Shield blocked the attack!"]
]) {
  assert.equal(win.OSO_GAME_I18N.translate(ko), en, `RPG English translation missing for ${ko}`);
}
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
  ["시장 원로: 지하창고부터 차근차근 살펴보게. 서두르지 않아도 길은 하나씩 열리네.", "Market Elder: Start with the basement warehouse. Take your time; one path will open after another."],
  ["이 지역의 강적을 3번 더 물리치시오.", "Defeat 3 more powerful enemies in this area."],
  ["마왕 흑우령에게 도전하시오.", "Challenge Demon King Heuk-u-ryeong."],
  ["시장 지하창고의 워프진이 중앙시장과 연결됐다!", "The Market Basement warp is now linked to Central Market!"],
  ["마왕 흑우령의 공격! 37 피해!", "Demon King Heuk-u-ryeong attacks! 37 damage!"],
  ["남강 갑각수을(를) 물리쳤다! EXP 40 획득!", "Defeated Namgang Armored Beast! Earned 40 EXP!"],
  ["마왕 흑우령 격파 보상! 🪙 +3,000", "Demon King Heuk-u-ryeong victory reward! 🪙 +3,000"],
  ["공격 28 · 방어 19", "ATK 28 · DEF 19"],
  ["포션 2 · 에테르 1 · 성수 0", "Potion 2 · Ether 1 · Holy Water 0"],
  ["LV 9 · 중앙시장 · 누적 12,450점", "LV 9 · Central Market · Total 12,450 pts"],
  ["오소용사, 마왕과 암흑영웅장군을 넘어 대천사 논개의 봉인까지 풀어냈군. 이제야 진주의 하늘과 땅이 함께 평온해졌네.", "Hero OSO, you've defeated the Demon King and Dark Hero General, then broken Archangel Nongae's seal. At last, peace has returned to Jinju."],
  ["15 연타", "15 taps"],
  ["점프 2/2", "Jumps 2/2"],
  ["초필살기 75%", "SPECIAL 75%"],
  ["10 / 15 단", "10 / 15 layers"],
  ["속도 ×1.25", "Speed ×1.25"],
  ["나가기", "Exit"]
];
for (const [ko, en] of examples) {
  assert.equal(win.OSO_GAME_I18N.translate(ko), en, `Wrong translation for ${ko}`);
}
const gpsRoundtrip = [
  "🎯 현장 게임 획득 구역 7곳",
  "진주중앙시장 주차장",
  "📍 진주중앙시장 주차장",
  "GPS 작동 중 · 정확도 약 ±18m",
  "GPS 신호가 너무 약합니다 (±162m). 잠시 이동하거나 하늘이 보이는 곳에서 다시 확인하소.",
  "📡 획득 구역까지 약 28m",
  "오소의 장바구니 획득구역이 가까워졌소!",
  "3구 어시장 인근 전부 방향 · 약 32m",
  "오소의 장바구니 QR 확인 완료!",
  "오소의 장바구니은 이미 획득했소!"
];
for (const korean of gpsRoundtrip) {
  const english = win.OSO_I18N.format(korean);
  assert.notEqual(english, korean, `GPS translation missing: ${korean}`);
  win.OSO_I18N.setLanguage("ko");
  const restored = win.OSO_I18N.format(english);
  assert.equal(restored, korean, `GPS notice did not round-trip: ${korean}`);
  win.OSO_I18N.setLanguage("en");
}
assert.ok(html.includes('id="locationList"'), "Market exploration must show the seven GPS stops");
win.OSO_I18N.setLanguage("ko");
assert.equal(win.OSO_I18N.getLanguage(), "ko");
win.OSO_I18N.setLanguage("en");
assert.equal(win.OSO_I18N.getLanguage(), "en");
assert.equal(memory.get("oso.language.v1"), "en");
assert.ok(html.includes('src="./oso-game-i18n.js'), "Game translator must load");
assert.ok(html.indexOf('src="./oso-rpg-strings.js') < html.indexOf('src="./oso-game-i18n.js'), "RPG dictionary must load before stage translator");
assert.ok(html.indexOf('src="./oso-rpg-dynamic.js') < html.indexOf('src="./oso-game-i18n.js'), "Dynamic RPG formatter must load before stage translator");
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
