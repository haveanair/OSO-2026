import assert from "node:assert/strict";
import { chromium } from "playwright";

// CI runs the real play/index.html and its companion scripts under a local HTTP server.
// This is a smoke test; GPS accuracy and camera permission still require field testing.
const base = process.env.OSO_TEST_URL || "http://127.0.0.1:8765/play/";
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const errors = [];
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "ko-KR",
    serviceWorkers: "allow"
  });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(String(error)));
  const response = await page.goto(base, { waitUntil: "domcontentloaded", timeout: 45000 });
  assert.equal(response?.status(), 200, "Game page should load");

  await page.waitForFunction(() => !!window.OSO_I18N, null, { timeout: 30000 });
  assert.equal(await page.locator("#oso-language-switch button").count(), 2);
  assert.equal(await page.evaluate(() => document.documentElement.lang), "ko");
  // The language buttons live on the title splash. Skip both logos using the game's own Skip button.
  await page.evaluate(() => {
    const skip = document.getElementById("skip1");
    if (typeof skip?.onclick !== "function") throw new Error("Splash skip handler missing");
    skip.click();
  });
  await page.waitForFunction(() => document.querySelector("#titleSplash")?.classList.contains("show"), null, { timeout: 10000 });
  await page.locator('#oso-language-switch button[data-oso-language="en"]').click();
  const languageDiagnostics = await page.evaluate(() => ({
    locale: window.OSO_I18N?.getLanguage?.(),
    rootLanguage: document.documentElement.lang,
    start: document.querySelector("#startBtn")?.textContent,
    translatedStart: window.OSO_I18N?.t?.("🎮 게임 시작!"),
    shellText: document.querySelector(".cleanLogo")?.textContent
  }));
  console.log("OSO language switch diagnostics:", JSON.stringify(languageDiagnostics));
  await page.waitForFunction(() => document.querySelector("#startBtn")?.textContent?.includes("Start Playing"), null, { timeout: 10000 });
  assert.equal(await page.evaluate(() => document.documentElement.lang), "en");
  assert.ok((await page.locator("#manualModal .manualScroll").innerText()).includes("Seven") ||
    (await page.locator("#manualModal .manualScroll").innerText()).includes("Play seven"));

  // The real arcade re-renders these labels after each round; stage translation must be reversible.
  await page.evaluate(() => {
    const result = document.createElement("div");
    result.className = "result";
    result.id = "oso-test-result";
    result.innerHTML = `<div class="resultBadge">💥 GAME OVER · 🏆 신기록!</div>
      <div>🪙 +150 (기본 100 + 장바구니 획득 50) · 현재 보유 1,250</div>
      <div>🏆 누적점수 12,345점</div>
      <div class="actions"><button>한판 더!</button></div>`;
    document.getElementById("stage").appendChild(result);
  });
  await page.waitForFunction(() => document.querySelector("#oso-test-result")?.textContent?.includes("Play Again!"));
  assert.ok((await page.locator("#oso-test-result").innerText()).includes("Total Score 12,345 pts"));
  assert.ok((await page.locator("#oso-test-result").innerText()).includes("Balance 1,250"));
  await page.evaluate(() => window.OSO_I18N.setLanguage("ko"));
  await page.waitForFunction(() => document.querySelector("#oso-test-result")?.textContent?.includes("한판 더!"));
  assert.ok((await page.locator("#oso-test-result").innerText()).includes("현재 보유 1,250"));
  await page.locator("#oso-test-result").evaluate(element => element.remove());
  await page.evaluate(() => window.OSO_I18N.setLanguage("en"));

  // A simulated RPG scene exercises live battle/NPC text without bypassing GPS game unlocks.
  await page.evaluate(() => {
    const fantasy = document.createElement("div");
    fantasy.id = "oso-rpg-test";
    fantasy.className = "fantasyWrap";
    fantasy.innerHTML = `<div class="fantasyDialog">
        <b>시장 원로</b>
        <span>지하창고부터 차근차근 살펴보게. 서두르지 않아도 길은 하나씩 열리네.</span>
      </div>
      <div class="fantasyLog">마왕 흑우령의 공격! 37 피해!</div>
      <div class="fantasyBattleInfo">황금장바구니방패가 공격을 막았다!</div>
      <div class="fantasySaveStatus">LV 9 · 중앙시장 · 누적 12,450점</div>
      <div class="fantasyMerchantSpeech">시장 원로: 지하창고부터 차근차근 살펴보게. 서두르지 않아도 길은 하나씩 열리네.</div>
      <div class="fantasyQuest">상점에서 장비와 약을 정비하고 북쪽 통로로 본편 던전을 진행하시오.</div>
      <div class="fantasyShopPanel">1884 황금검</div>`;
    document.getElementById("stage").appendChild(fantasy);
  });
  await page.waitForFunction(() => document.querySelector("#oso-rpg-test")?.textContent?.includes("Market Elder"), null, { timeout: 12000 });
  let rpgText = await page.locator("#oso-rpg-test").innerText();
  assert.ok(rpgText.includes("The Golden Basket Shield blocked the attack!"));
  assert.ok(rpgText.includes("Start with the basement warehouse."));
  assert.ok(rpgText.includes("1884 Golden Sword"));
  assert.ok(rpgText.includes("Demon King Heuk-u-ryeong attacks! 37 damage!"));
  assert.ok(rpgText.includes("Market Elder: Start with the basement warehouse."));
  assert.ok(rpgText.includes("LV 9 · Central Market · Total 12,450 pts"));
  await page.evaluate(() => window.OSO_I18N.setLanguage("ko"));
  await page.waitForFunction(() => document.querySelector("#oso-rpg-test")?.textContent?.includes("시장 원로"), null, { timeout: 10000 });
  rpgText = await page.locator("#oso-rpg-test").innerText();
  assert.ok(rpgText.includes("황금장바구니방패가 공격을 막았다!"));
  assert.ok(rpgText.includes("마왕 흑우령의 공격! 37 피해!"));
  assert.ok(rpgText.includes("LV 9 · 중앙시장 · 누적 12,450점"));
  await page.locator("#oso-rpg-test").evaluate(element => element.remove());
  await page.evaluate(() => window.OSO_I18N.setLanguage("en"));

  const games = [
    "오소의 장바구니", "팔딱팔딱 수산시장", "차곡차곡 비단쌓기", "오소 장보기 RUN",
    "시장 싹쓸이!", "떡! 떡! 떡!", "파워덕질 1초 연타왕", "오소 우주파이터",
    "오소레이싱", "오소 환상대모험"
  ];
  const translated = await page.evaluate(keys => keys.map(k => window.OSO_I18N.t(k)), games);
  assert.equal(new Set(translated).size, 10);
  assert.ok(translated.every((translation, index) => translation !== games[index]),
    "All ten game titles should have English translations");

  // Enter the actual game listing, not just the title screen.
  await page.locator("#startBtn").click();
  await page.waitForFunction(() => document.querySelector("#app") && !document.querySelector("#app").classList.contains("hidden"), null, { timeout: 10000 });
  // Locked games intentionally show "???" instead of their title until GPS/QR unlock.
  // Their descriptions and location hints still need English translations.
  await page.waitForFunction(() => document.querySelector('#library [data-game="basket"] small')?.textContent?.includes("Catch market goods"), null, { timeout: 15000 });
  assert.ok((await page.locator('#library [data-game="basket"] small').innerText()).includes("Catch market goods"));
  await page.locator('#library [data-game="basket"]').click();
  await page.waitForFunction(() => document.querySelector("#mName")?.textContent === "Locked Game");
  assert.ok((await page.locator("#mArea").innerText()).includes("Jinju Central Market parking area"));
  await page.locator("#mClose").click();

  await page.evaluate(() => window.OSO_I18N.setLanguage("ko"));
  await page.waitForFunction(() => document.querySelector('#library [data-game="basket"] small')?.textContent?.includes("상품을"));
  assert.equal(await page.evaluate(() => localStorage.getItem("oso.language.v1")), "ko");
  assert.ok((await page.locator("#manualModal .manualScroll").innerText()).includes("7가지 미니게임"));

  const manifest = await page.evaluate(async () => {
    const response = await fetch("./manifest.webmanifest");
    const data = await response.json();
    return { status: response.status, icons: data.icons, scope: data.scope };
  });
  assert.equal(manifest.status, 200);
  assert.ok(manifest.icons.some(icon => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some(icon => icon.sizes === "512x512"));
  const iconStatus = await page.evaluate(async icons => Promise.all(icons.filter(icon => icon.type === "image/png").map(async icon => {
    const response = await fetch(new URL(icon.src, new URL("./manifest.webmanifest", location.href)));
    return { src: icon.src, status: response.status };
  })), manifest.icons);
  assert.ok(iconStatus.every(icon => icon.status === 200), "PWA icon files must load");
  // Validate the shared PWA shell under a temporary network outage.
  // This does not claim that every mini-game works offline; it checks the cached entry point.
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 25000 });
  const offlineCachePresent = await page.evaluate(async () => {
    const keys = await caches.keys();
    const active = keys.find(key => key.startsWith("oso-tourism-shell-"));
    if (!active) return false;
    const cache = await caches.open(active);
    return !!(await cache.match(new URL("./index.html", location.href).href));
  });
  assert.ok(offlineCachePresent, "The service worker should cache the game entry point");
  await context.setOffline(true);
  const cachedResponse = await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  assert.equal(cachedResponse?.status(), 200, "Offline repeat visit must use the cached HTML shell");
  await page.waitForFunction(() => !!window.OSO_I18N, null, { timeout: 12000 });
  assert.equal(await page.evaluate(() => localStorage.getItem("oso.language.v1")), "ko",
    "A temporary network outage must not erase the selected language");
  await context.setOffline(false);
  assert.deepEqual(errors, [], "No uncaught JavaScript exceptions in opening screens");

  // The market-tour stops are populated from the existing game model, not fabricated map pins.
  const gpsContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: "en-US",
    permissions: ["geolocation"],
    geolocation: { latitude: 35.197412338175, longitude: 128.08448465174, accuracy: 12 },
    serviceWorkers: "allow"
  });
  try {
    const gpsPage = await gpsContext.newPage();
    gpsPage.on("pageerror", error => errors.push("GPS mock: " + String(error)));
    await gpsPage.goto(base, { waitUntil: "domcontentloaded", timeout: 45000 });
    await gpsPage.waitForFunction(() => !!window.OSO_I18N, null, { timeout: 15000 });
    await gpsPage.evaluate(() => document.getElementById("skip1").click());
    await gpsPage.locator("#startBtn").click();
    await gpsPage.locator('nav button[data-page="mapPage"]').click();
    await gpsPage.waitForFunction(() => document.querySelectorAll("#locationList .locationRow").length === 7, null, { timeout: 10000 });
    assert.ok((await gpsPage.locator("#osoStopsTitle").innerText()).includes("7 Market Game Stops"));
    await gpsPage.waitForFunction(() => {
      const data = JSON.parse(localStorage.getItem("jcm-v168-locked") || "{}");
      return data.gpsUnlocked?.basket === true;
    }, null, { timeout: 30000 });
    const gpsState = await gpsPage.evaluate(() => JSON.parse(localStorage.getItem("jcm-v168-locked") || "{}"));
    assert.equal(gpsState.gpsUnlocked.basket, true, "Parking-area GPS must unlock shopping basket");
    assert.equal(gpsState.unlock.basket, true);
    assert.ok((await gpsPage.locator("#gpsStatus").innerText()).includes("GPS active"));
    assert.ok((await gpsPage.locator("#locationList").innerText()).includes("Jinju Central Market Parking Area"));
    assert.ok((await gpsPage.locator("#locationList").innerText()).includes("Unlocked by GPS"));
    // Move the same simulated device through all remaining official game coordinates.
    // This checks the real watchPosition -> closest-zone -> unlock pathway.
    const remainingGpsZones = [
      ["fish", 35.195345669871315, 128.08535934581866],
      ["stack", 35.194615480555584, 128.08561322498929],
      ["run", 35.194274577002346, 128.08568564761663],
      ["slice", 35.194941119149156, 128.08469439128578],
      ["tteok", 35.19522503998621, 128.0849524090848],
      ["powerduck", 35.194613594496, 128.08480142824]
    ];
    for (const [code, latitude, longitude] of remainingGpsZones) {
      await gpsContext.setGeolocation({ latitude, longitude, accuracy: 12 });
      await gpsPage.waitForFunction(target => {
        const data = JSON.parse(localStorage.getItem("jcm-v168-locked") || "{}");
        return data.gpsUnlocked?.[target] === true;
      }, code, { timeout: 12000 });
    }
    const collected = await gpsPage.evaluate(() => JSON.parse(localStorage.getItem("jcm-v168-locked") || "{}"));
    assert.equal(Object.values(collected.gpsUnlocked).filter(Boolean).length, 7,
      "All seven on-site games should unlock at their own simulated coordinates");
    assert.equal(collected.unlock.spacefighter, true,
      "Collecting all seven market games should still unlock OSO Space Fighter");
    console.log("OSO simulated seven-zone GPS unlock test: PASS");
  } finally {
    await gpsContext.close();
  }
  console.log("OSO bilingual mobile smoke test: PASS");
  await context.close();
} finally {
  await browser.close();
}
