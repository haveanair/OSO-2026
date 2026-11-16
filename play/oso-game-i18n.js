/* OSO Stage Localization v1
 * Display-only translation of gameplay HUD, in-game help, menus and result screens.
 * This file must not change score calculations, GPS, input events, timers or save state.
 */
(() => {
  "use strict";
  if (window.OSO_GAME_I18N) return;
  const core = () => window.OSO_I18N;
  const stage = () => document.getElementById("stage");
  const targetSelectors = [
    ".result", ".gameTip", ".marketSign", ".silkSign", ".pdTitle",
    ".pdNeed", ".pdText", ".pdCount", ".pdStageText", ".pdStageLabel",
    ".coinCelebrateCard", ".raceSection", ".raceControlHint", ".raceResult",
    ".fantasyWrap", ".fantasyDialog", ".fantasyQuest", ".fantasyPlace", ".fantasySaveMenu",
    ".fantasyMapOverlay", ".fantasyStatusPage", ".fantasyEndingThanks",
    ".fantasyEndingChapter", ".fantasyEndingFinal", ".fantasyEndingCopyright",
    ".sfCraftSelect", ".sfClearOverlay", ".sfEndOverlay", ".spaceResult",
    ".spaceEnding", ".spaceHud", ".gameClearScreen",
    "#fantasyStatusBody", ".pdResult", ".levelUp", ".rankHint"
  ].join(",");
  const pairs = {
    "나가기":"Exit", "한판 더!":"Play Again!", "신기록!":"New Record!",
    "🎉 클리어!":"🎉 Stage Clear!", "💥 GAME OVER · 🏆 신기록!":"💥 GAME OVER · 🏆 New Record!",
    "💥 GAME OVER":"💥 GAME OVER", "기본":"Base", "게임 중 획득":"Earned in Game",
    "장바구니 획득":"Basket Bonus", "수산시장 획득":"Fish Market Bonus",
    "달리기 획득":"Run Bonus", "시장 싹쓸이 획득":"Market Slice Bonus",
    "슈팅 획득":"Shooting Bonus", "레이스 획득":"Racing Bonus",
    "모험 획득":"Adventure Bonus", "RPG 클리어 보너스":"RPG Clear Bonus",
    "해금!":"Unlocked!", "싱싱 청과":"Fresh Produce",
    "LEVEL 3부터 좌우 흔들림 · LEVEL 4부터 2개 동시낙하 · 동전은 실제 코인 보너스!":
      "Items sway from Level 3 and drop in pairs from Level 4. Collect coins for bonuses!",
    "팔딱팔딱 수산시장":"Splashing Fish Market",
    "생선 사이에 간헐적으로 동전 등장 · 잡으면 실제 코인 보너스!":
      "Bonus coins sometimes appear among the fish. Catch them for extra coins!",
    "차곡차곡 비단쌓기":"Silk Stack Challenge",
    "화면을 눌러 비단을 떨어뜨리소!":"Tap to drop a silk bundle!",
    "비단 폭이 점점 좁아지고 속도가 빨라집니다 · 15단 완성 목표":
      "The silk gets narrower and faster. Stack all 15 layers!",
    "정확도 0%":"Accuracy 0%",
    "동전 한 패턴 완주 = GREAT! · GREAT 1회=3단점프권 · GREAT 3회마다 ❤️ +1":
      "Complete a coin pattern for GREAT! One GREAT earns a triple jump; every three GREATs give +1 heart.",
    "중앙시장 먹거리 싹쓸이!":"Central Market Food Slice!",
    "비빔밥 · 국수 · 호떡 · 김밥 · 떡볶이 · 주스 · 통닭":
      "Bibimbap · Noodles · Hotteok · Gimbap · Tteokbokki · Juice · Chicken",
    "음식 사이에 간헐적으로 동전 등장 · 베면 실제 코인 보너스!":
      "Coins sometimes appear among the food. Slice them for a bonus!",
    "1884 전통 떡집":"Traditional Rice Cake Shop · 1884",
    "쿵! 떡메 내리치기":"THUMP! Strike the rice cake",
    "1초 연타 파괴 챌린지":"One-Second Tap Challenge",
    "출격 선택":"Choose Your Fighter",
    "캐릭터 또는 KF-21 전투기를 선택하시오":"Choose a character or the KF-21 fighter jet",
    "캐릭터":"Character", "현재 선택":"Selected",
    "기존 공격 · 기존 초필살기":"Standard attack · Character special move",
    "전용 고속 트레이서 일반탄":"High-speed tracer rounds",
    "초필살기: 미사일 폭격 · 대량 폭발":"Special: Missile barrage · Massive explosions",
    "5스테이지 클리어 보상 · 해금 후 영구 사용":"Clear five stages to unlock permanently",
    "지구에 평화가 찾아왔다.":"Peace has returned to Earth.",
    "오소와 친구들이 악의 본거지를 무너뜨렸소!":"OSO and friends have defeated the forces of evil!",
    "1884 진주중앙시장 파이팅!":"Long live Jinju Central Market, founded in 1884!",
    "KF-21 전투기 해금!":"KF-21 Fighter Unlocked!",
    "다음 출격부터 선택할 수 있소.":"You can select it on your next sortie.",
    "캐릭터 / KF-21":"Character / KF-21",
    "중앙시장":"Central Market",
    "◀ ▶ 조향 · DRIFT · ACCEL · BRAKE":"◀ ▶ Steer · DRIFT · ACCEL · BRAKE",
    "모험 메뉴":"Adventure Menu",
    "저장 데이터를 확인하는 중…":"Checking your saved adventure…",
    "스테이터스":"Status", "중간 저장":"Save Progress", "불러오기":"Load Game",
    "계속하기":"Continue", "모험 메뉴로":"Back to Adventure Menu",
    "전체 지도":"World Map", "🔴 현재 위치":"🔴 You Are Here",
    "🟡 주민":"🟡 Resident", "🟠 보물상자":"🟠 Treasure Chest",
    "🟣 보스":"🟣 Boss", "🔵 출구":"🔵 Exit", "지도 닫기":"Close Map",
    "사람·상자·문 앞에서":"Near a person, chest or door",
    "A 버튼":"A Button", "A 조사":"A Interact",
    "공격":"Attack", "마법":"Magic", "필살기":"Special",
    "방어":"Defend", "아이템":"Items", "도망":"Escape",
    "경험치":"Experience", "전투 능력":"Combat Stats",
    "장비":"Equipment", "무기":"Weapon", "방어구":"Armor",
    "장신구":"Accessory", "소지품 · 특별 장비":"Inventory · Special Gear",
    "황금장바구니방패":"Golden Basket Shield",
    "전설의 조선무":"Legendary Joseon Radish",
    "진주암흑동굴":"Jinju Dark Cave",
    "암흑영웅장군":"Dark Hero General",
    "촉석루천상궁전":"Chokseongnu Celestial Palace",
    "대천사논개":"Archangel Nongae",
    "최고 단계까지 강화 완료!":"Fully upgraded!",
    "현재 장비가 최종 단계입니다.":"This equipment is already at maximum level.",
    "대화 끝내기":"End Conversation",
    "그러면 숨겨진 최강장비를 찾아보시오.":"Then seek the hidden legendary equipment.",
    "이 마을 어딘가에 숨겨져 있소.":"It's hidden somewhere in this town.",
    "코인이 부족합니다.":"Not Enough Coins.",
    "아직 익힌 마법이 없다.":"No magic learned yet.",
    "아직 익힌 필살기가 없다.":"No special skill learned yet.",
    "취소":"Cancel", "마왕 흑우령 격파":"Dark Demon King Defeated",
    "암흑영웅장군 격파":"Dark Hero General Defeated",
    "마왕이 사라지자 진주에 아침이 돌아왔다.":"As the demon king vanished, dawn returned to Jinju.",
    "마왕은 쓰러졌지만 모험은 끝나지 않았다.":"The demon king has fallen, but the adventure continues.",
    "마을사람들에게 새로 나타난 기운에 대해 물어보자.":"Ask the townspeople about the strange new force.",
    "진정한 평화":"True Peace",
    "1884 진주중앙시장":"Jinju Central Market · Est. 1884",
    "진정한 평화가 돌아왔소! · TRUE END":"True Peace Returns! · TRUE END",
    "이 게임을 플레이 해 주셔서 감사합니다.":"Thank you for playing!",
    "많은 사랑 부탁드립니다.":"Please visit and support Jinju Central Market!",
    "🌊 논개 캐릭터 2종 해금!":"🌊 Two Nongae Characters Unlocked!",
    "논개의 봉인을 풀었소!":"You've broken Nongae's seal!",
    "도감에서 3,000 코인대에 구매할 수 있소.":"You can purchase them in the collection for around 3,000 coins.",
    "보유 코인 달성!":"Coin Milestone Reached!",
    "축하하소! 다음 목표도 도전!":"Congratulations! Go for the next milestone!",
    "잠시 후 자동으로 닫힙니다":"This closes automatically in a moment",
    "기본 오소":"Default OSO",
    "과일":"Fruit", "수박":"Watermelon", "게임패드":"Gamepad",
    "큰 오락기":"Large Arcade Machine", "지구":"Earth",
    "단계":"Stage", "남은 시간":"Time Left",
    "NEW RECORD!":"NEW RECORD!",
  };
  const dictionary = new Map([...Object.entries(pairs), ...Object.entries(window.OSO_RPG_STRINGS || {})]);
  const reverse = new Map(Object.entries(pairs).map(([ko, en]) => [en, ko]));
  const memory = new WeakMap();

  function translate(raw) {
    const coreResult = core()?.t?.(raw);
    if (coreResult && coreResult !== raw) return coreResult;
    if (dictionary.has(raw)) return dictionary.get(raw);
    let m;
    if ((m = raw.match(/^🏆 누적점수 ([\d,]+)점$/))) return `🏆 Total Score ${m[1]} pts`;
    if ((m = raw.match(/^🏆 최고 ([\d,]+)$/))) return `🏆 Best ${m[1]}`;
    if ((m = raw.match(/^🪙 \+([\d,]+)(.*?) · 현재 보유 ([\d,]+)$/))) {
      const extras = m[2].replace(/기본/g, "Base").replace(/장바구니 획득/g, "Basket Bonus")
        .replace(/수산시장 획득/g, "Fish Market Bonus").replace(/달리기 획득/g, "Run Bonus")
        .replace(/시장 싹쓸이 획득/g, "Market Slice Bonus").replace(/슈팅 획득/g, "Shooting Bonus")
        .replace(/레이스 획득/g, "Racing Bonus").replace(/모험 획득/g, "Adventure Bonus")
        .replace(/게임 중 획득/g, "Game Bonus").replace(/RPG 클리어 보너스/g, "RPG Clear Bonus");
      return `🪙 +${m[1]}${extras} · Balance ${m[3]}`;
    }
    if ((m = raw.match(/^🔓 (.+) 해금!$/))) {
      const names = m[1].split(" · ").map(name => core()?.t?.(name) || dictionary.get(name) || name);
      return `🔓 ${names.join(" · ")} Unlocked!`;
    }
    if ((m = raw.match(/^([\d,]+) 연타$/))) return `${m[1]} taps`;
    if ((m = raw.match(/^([\d,]+) \/ 15 단$/))) return `${m[1]} / 15 layers`;
    if ((m = raw.match(/^정확도 ([\d.]+)%$/))) return `Accuracy ${m[1]}%`;
    if ((m = raw.match(/^속도 ×([\d.]+)$/))) return `Speed ×${m[1]}`;
    if ((m = raw.match(/^찰기 ([\d.]+)%$/))) return `Chewiness ${m[1]}%`;
    if ((m = raw.match(/^공격력 ([\d,]+)$/))) return `Attack ${m[1]}`;
    if ((m = raw.match(/^방어력 ([\d,]+)$/))) return `Defense ${m[1]}`;
    if ((m = raw.match(/^([\d,]+)점$/))) return `${m[1]} pts`;
    return raw;
  }
  function localizeText(node) {
    if (node.nodeType !== Node.TEXT_NODE) return;
    const host = node.parentElement;
    if (!host || host.closest("script,style,svg,canvas,textarea,[data-oso-no-translate]")) return;
    const chosen = core()?.getLanguage?.() || "ko";
    const current = node.nodeValue;
    const saved = memory.get(node);
    if (chosen === "ko") {
      if (saved && current === saved.en && current !== saved.ko) node.nodeValue = saved.ko;
      return;
    }
    if (saved && current === saved.en) return;
    const trimmed = current.trim();
    if (!trimmed) return;
    const value = translate(trimmed);
    if (value === trimmed) return;
    const prefix = current.match(/^\s*/)?.[0] || "";
    const suffix = current.match(/\s*$/)?.[0] || "";
    const target = prefix + value + suffix;
    memory.set(node, { ko: current, en: target });
    if (current !== target) node.nodeValue = target;
  }
  function walkText(root) {
    if (root.nodeType === Node.TEXT_NODE) { localizeText(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE || root.closest("script,style,canvas,svg")) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) localizeText(walker.currentNode);
  }
  function scan(root) {
    const container = stage();
    if (!container) return;
    if (root.nodeType === Node.TEXT_NODE) {
      if (root.parentElement?.closest(targetSelectors)) walkText(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (root !== container && !container.contains(root)) return;
    if (root.matches(targetSelectors) || root.closest(targetSelectors)) walkText(root);
    else root.querySelectorAll(targetSelectors).forEach(walkText);
  }
  function repaint() {
    const container = stage();
    if (container) container.querySelectorAll(targetSelectors).forEach(walkText);
  }
  let queued = false;
  const pending = new Set();
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "characterData") pending.add(record.target);
      else for (const child of record.addedNodes) pending.add(child);
    }
    if (queued || !pending.size) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const nodes = Array.from(pending);
      pending.clear();
      nodes.forEach(scan);
    });
  });
  function boot() {
    const container = stage();
    if (!container) return;
    observer.observe(container, { subtree: true, childList: true, characterData: true });
    window.addEventListener("oso:languagechange", repaint);
    repaint();
  }
  window.OSO_GAME_I18N = Object.freeze({ translate, repaint, dictionarySize: dictionary.size });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();