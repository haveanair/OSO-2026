/* OSO bilingual UI foundation — 2026-11-16.
 * No gameplay state keys, GPS coordinates, or scoring logic are modified.
 * Translate known UI copy only. Newly authored game strings should use OSO_I18N.t(key).
 */
(() => {
  "use strict";
  if (window.OSO_I18N) return;
  const KEY = "oso.language.v1";
  const LABELS = Object.freeze({
    "1884 진주중앙시장": "Jinju Central Market · Est. 1884",
    "오늘 뭐하고 놀겠소?": "What shall we play today?",
    "어서오소!": "OSO! Welcome!",
    "중앙시장 게임장": "Central Market Arcade",
    "오소와 친구들이 펼치는 시장 & 우주 대작전": "Market & space adventures with OSO and friends",
    "10가지 게임 + 시장 탐험 + 오소 도감": "10 Games + Market Exploration + OSO Collection",
    "🎮 게임 시작!": "🎮 Start Playing!",
    "내 기록": "My Records",
    "점수 · 랭킹": "Scores · Rankings",
    "시장 탐험": "Explore the Market",
    "지도 · GPS": "Map · GPS",
    "오소 도감": "OSO Collection",
    "수집 · 사용": "Collect · Play",
    "📘 플레이 방법": "📘 How to Play",
    "건너뛰기": "Skip",
    "🏆 중앙시장 누적 점수 랭킹": "🏆 Central Market All-Time Rankings",
    "순위별 기준 최초 돌파 시 1회 등록 · TOP 10": "First to reach each milestone · TOP 10",
    "잠시 후 타이틀 화면으로 돌아갑니다": "Returning to the title screen shortly",
    "어서오소!": "OSO! Welcome!",
    "타이틀 화면으로": "Return to title",
    "🏠 홈": "🏠 Home",
    "🎮 오늘 뭐하고 놀겠소?": "🎮 What shall we play today?",
    "🗺️ 시장 탐험": "🗺️ Explore the Market",
    "시장 안에서 자동으로 게임을 획득하소!": "Unlock games as you explore the market!",
    "위치 권한을 허용하면 지정 구역 진입 시 자동 해금합니다. 내부 통로 5곳도 GrowMaps 기준 좌표가 기본값으로 고정되어 있으며, QR은 GPS 수신이 불안정할 때 보조 해금으로 사용할 수 있습니다.":
      "Allow location access to unlock games when you enter their zones. Five indoor paths use saved GrowMaps-based coordinates. If GPS is unreliable indoors, scan the on-site QR codes instead.",
    "📡 GPS 위치 확인 시작": "📡 Start GPS Location",
    "▣ QR 보조 해금": "▣ Unlock with QR",
    "위치 확인 대기 중": "Waiting for location",
    "실제 지도는 GrowMaps 사용": "View the market map on GrowMaps",
    "시장 내부 지도를 임의로 다시 그리지 않습니다. 실제 지도는 GrowMaps에서 확인하고, 이 화면에서는":
      "The market layout is not redrawn here. Check the real map on GrowMaps; this screen provides",
    "GPS 작동 상태와 QR 보조 해금": "GPS status and QR-based unlocking",
    "을 제공합니다.": ".",
    "GrowMaps 실제 지도 열기": "Open GrowMaps",
    "🛠 GPS 기준점 수동 보정 (예비 기능)": "🛠 Adjust GPS calibration (advanced)",
    "7개 획득 구역 모두 기본 GPS 구역이 설정되어 있습니다. 내부 통로 5곳은 GrowMaps 기준값을 사용하며, 아래 수동 보정은 현장 GPS 오차 때문에 특정 구역을 다시 잡아야 할 때만 사용하는 예비 기능입니다.":
      "All seven unlock zones have default GPS coordinates. Five indoor paths use GrowMaps reference locations. Recalibrate only if a zone needs adjustment due to on-site GPS error.",
    "① 통로 시작점 저장": "① Save Path Start",
    "② 통로 끝점 저장": "② Save Path End",
    "● 원형 중심 저장": "● Save Circle Center",
    "아직 보정하지 않았습니다.": "Not calibrated yet.",
    "누적점수 랭킹 보기": "View All-Time Rankings",
    "순위별 최초 돌파 기록 · TOP 10": "First milestones · TOP 10",
    "📖 오소 도감 + 친구들 · 캐릭터 상점": "📖 OSO & Friends · Character Shop",
    "선택한 캐릭터": "Selected character",
    "기본 오소": "Default OSO",
    "오소·아요·하모 중 게임에서 사용할 캐릭터를 선택하소!": "Choose OSO, AYO or HAMO as your playable character!",
    "🪙 보유 코인": "🪙 Coins",
    "게임": "Games",
    "닫기": "Close",
    "플레이": "Play",
    "현장 게임 QR을 카메라로 스캔하소.": "Scan the on-site game QR code with your camera.",
    "직접 실행(content://)에서도 후면카메라 촬영이 열리도록 개선했습니다.":
      "You can also capture a QR image using your rear camera.",
    "QR 카메라를 열거나 QR 사진을 선택하소.": "Open the QR camera or choose a QR photo.",
    "📷 QR 카메라 / 촬영": "📷 Scan QR / Camera",
    "🖼 사진에서 QR 읽기": "🖼 Choose QR Photo",
    "📸 QR 사진 직접 촬영": "📸 Take a QR Photo",
    "지원되는 QR: 진주중앙시장 게임 획득 QR": "Supported: Jinju Central Market game QR codes",
    "게임 해금!": "Game Unlocked!",
    "새 게임을 획득했소!": "You unlocked a new game!",
    "게임 획득구역이 가까워졌소!": "A game unlock zone is nearby!",
    "앞으로 이동하소": "Keep walking",
    "1. 시장에서 게임 모으기": "1. Collect Games at the Market",
    "기본은 GPS 자동 해금": "GPS auto-unlock is the default",
    "입니다. 지정 구역에 들어오면 GAME GET 연출과 함께 자동 획득됩니다. 실내 GPS가 불안정할 때는 시장 탐험의":
      ". Enter a designated zone to unlock its game with a GAME GET animation. If GPS is inaccurate indoors, use",
    "을 눌러 현장 QR을 스캔합니다. 내부 통로 QR은 그 실제 위치를 GPS 기준점으로 함께 저장하며, 한 번 획득한 게임은 영구 보관됩니다.":
      "in Market Exploration to scan the on-site QR. Indoor QR scans can also save that location as a GPS reference point. Collected games remain unlocked.",
    "2. 7가지 미니게임": "2. Seven Market Mini-Games",
    "3. LEVEL 1~5": "3. Levels 1–5",
    "점수가 오르면 속도와 패턴이 단계적으로 어려워집니다.":
      "The speed and patterns become harder as your score increases.",
    "4. 코인 달성 축하": "4. Coin Milestones",
    "현재 보유 코인이": "A celebration appears when your coin balance reaches",
    "을 돌파하면 축하 연출이 나옵니다.": ".",
    "5. 실제 지도": "5. The Real Market Map",
    "확인되지 않은 점포 위치는 지도에 임의로 표시하지 않습니다. 게임별 해금 위치는 게임 선택 정보창에서 확인하고, 시장 탐험에서는 실제 지도와 GPS 상태를 확인합니다.":
      "Unverified store locations are not shown. Check the game details for unlock locations and use Market Exploration for map links and GPS status.",
    "누적 순위 기준 돌파!": "Ranking Milestone Reached!",
    "점": "pts",
    "랭킹에 남길 이름을 입력하소! 한글/영문/숫자 가능": "Enter a name for the rankings (Korean, English or numbers).",
    "랭킹 이름": "Ranking name",
    "랭킹 등록": "Submit Ranking",
    "← 게임목록": "← Game List",
    "🏆 최고 0": "🏆 Best 0"
  });
  const reverse = new Map(Object.entries(LABELS).map(([ko,en]) => [en,ko]));
  const roots = "#boot, #app, #modal, #qrModal, #gameGetOverlay, #directionToast, #rankModal, #manualModal, #initialModal, #gameOverlay > .gameBar";
  const ignored = "script, style, textarea, pre, code, #stage, svg, canvas, [data-oso-no-translate]";
  const allowed = new Set(["title", "aria-label", "placeholder"]);
  let language = (() => {
    try { const v = localStorage.getItem(KEY); if (v === "ko" || v === "en") return v; } catch (_) {}
    return /^en(?:-|$)/i.test(navigator.language || "") ? "en" : "ko";
  })();

  const lookup = (text, locale) => {
    const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
    if (!match) return text;
    const center = match[2];
    const ko = Object.prototype.hasOwnProperty.call(LABELS, center) ? center : reverse.get(center);
    if (!ko) return text;
    return match[1] + (locale === "en" ? LABELS[ko] : ko) + match[3];
  };
  function translateNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const host = node.parentElement;
      if (!host || host.closest(ignored) || !host.closest(roots)) return;
      const next = lookup(node.nodeValue, language);
      if (node.nodeValue !== next) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || node.matches(ignored)) return;
    if (!node.closest(roots) && !node.matches(roots)) return;
    for (const attr of allowed) {
      if (node.hasAttribute(attr)) {
        const value = node.getAttribute(attr);
        const next = lookup(value, language);
        if (next !== value) node.setAttribute(attr, next);
      }
    }
  }
  function walk(root) {
    if (!root) return;
    translateNode(root);
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) translateNode(walker.currentNode);
  }
  function repaint() {
    document.documentElement.lang = language;
    document.title = language === "en" ? "OSO! Jinju Central Market Arcade" : "어서오소! 진주중앙시장 게임장";
    document.querySelectorAll(roots).forEach(walk);
    document.querySelectorAll("[data-oso-language]").forEach(btn => {
      const active = btn.dataset.osoLanguage === language;
      btn.setAttribute("aria-pressed", String(active));
      btn.classList.toggle("active", active);
    });
  }
  function setLanguage(next) {
    if (next !== "ko" && next !== "en") return;
    language = next;
    try { localStorage.setItem(KEY, next); } catch (_) {}
    repaint();
    window.dispatchEvent(new CustomEvent("oso:languagechange", { detail: { language } }));
  }
  function mountSelector() {
    const title = document.querySelector(".cleanTitle");
    if (!title || title.querySelector("#oso-language-switch")) return;
    const bar = document.createElement("div");
    bar.id = "oso-language-switch";
    bar.className = "oso-language-switch";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "언어 선택 / Select language");
    bar.innerHTML = '<button type="button" data-oso-language="ko" lang="ko">한국어</button><button type="button" data-oso-language="en" lang="en">EN</button>';
    bar.addEventListener("click", event => {
      const btn = event.target.closest("button[data-oso-language]");
      if (btn) setLanguage(btn.dataset.osoLanguage);
    });
    title.appendChild(bar);
  }
  const style = document.createElement("style");
  style.textContent = '.oso-language-switch{position:absolute;right:6px;top:4px;display:flex;gap:3px;z-index:45;background:#fffbee;border:2px solid #765037;border-radius:99px;padding:3px;box-shadow:0 2px 5px #0002}.oso-language-switch button{border:0;border-radius:99px;padding:4px 7px;background:transparent;color:#765037;font-size:11px;font-weight:900;line-height:1.1}.oso-language-switch button.active{background:#ffc928;color:#392216}';
  document.head.appendChild(style);
  let scheduled = false;
  const changes = new Set();
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "characterData") changes.add(record.target);
      else if (record.type === "attributes") changes.add(record.target);
      else for (const added of record.addedNodes) changes.add(added);
    }
    if (scheduled || !changes.size) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const pending = Array.from(changes); changes.clear();
      pending.forEach(walk);
    });
  });
  function init() {
    mountSelector();
    repaint();
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["title", "aria-label", "placeholder"] });
  }
  window.OSO_I18N = Object.freeze({
    t: (key, fallback) => language === "en" ? (LABELS[key] || fallback || key) : key,
    getLanguage: () => language,
    setLanguage,
    getTranslationKeys: () => Object.keys(LABELS)
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();