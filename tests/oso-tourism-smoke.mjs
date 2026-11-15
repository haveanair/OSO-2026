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

  await page.locator('#oso-language-switch button[data-oso-language="en"]').click({ force: true });
  await page.waitForFunction(() => document.querySelector("#startBtn")?.textContent?.includes("Start Playing"), { timeout: 10000 });
  assert.equal(await page.evaluate(() => document.documentElement.lang), "en");
  assert.ok((await page.locator("#manualModal .manualScroll").innerText()).includes("Seven") ||
    (await page.locator("#manualModal .manualScroll").innerText()).includes("Play seven"));

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
  await page.locator("#startBtn").click({ force: true });
  await page.waitForFunction(() => document.querySelector("#app") && !document.querySelector("#app").classList.contains("hidden"), { timeout: 10000 });
  await page.waitForFunction(() => document.querySelector("#library")?.textContent?.includes("OSO's Shopping Basket"), { timeout: 15000 });
  assert.ok((await page.locator("#library").innerText()).includes("OSO's Shopping Basket"));

  await page.evaluate(() => window.OSO_I18N.setLanguage("ko"));
  await page.waitForFunction(() => document.querySelector("#library")?.textContent?.includes("오소의 장바구니"));
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
  assert.deepEqual(errors, [], "No uncaught JavaScript exceptions in opening screens");

  console.log("OSO bilingual mobile smoke test: PASS");
  await context.close();
} finally {
  await browser.close();
}
