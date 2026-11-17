/* OSO bilingual UI foundation — 2026-11-16.
 * No gameplay state keys, GPS coordinates, or scoring logic are modified.
 * Translate known UI copy only. Newly authored game strings should use OSO_I18N.t(key).
 */
(() => {
  "use strict";
  if (window.OSO_I18N) return;
  const KEY = "oso.language.v1";
  const LABELS = Object.freeze({
    "🐂 오소": "🐂 OSO",
    "🐱 아요 컬렉션": "🐱 AYO Collection",
    "🦦 하모 컬렉션": "🦦 HAMO Collection",
    "🌊 논개 컬렉션": "🌊 Nongae Collection",
    "중앙시장의 주인공 · 기본~750 코인": "Market mascot · Free–750 coins",
    "표정과 동작이 다양한 친구 · 1,000~1,900 코인": "An expressive friend · 1,000–1,900 coins",
    "특별한 친구 · 2,000~2,900 코인": "A special friend · 2,000–2,900 coins",
    "해금조건 : 오소 환상대모험 이벤트 클리어 · 3,000 코인대": "Clear the OSO Fantasy Adventure event to unlock · 3,000+ coins",
    "오소": "OSO",
    "아요": "AYO",
    "하모": "HAMO",
    "논개": "Nongae",
    "호기심 오소": "Curious OSO",
    "몹시 화난 오소": "Furious OSO",
    "반가운 오소": "Welcoming OSO",
    "파티 오소": "Party OSO",
    "1884 맥주 오소": "1884 Beer OSO",
    "청과시장 오소": "Produce Market OSO",
    "수산시장 오소": "Fish Market OSO",
    "장보기 오소": "Shopping OSO",
    "기본 캐릭터": "Default character",
    "공식 응용동작": "Alternate pose",
    "인사 아요": "Waving AYO",
    "안경 아요": "Glasses AYO",
    "신나는 아요": "Dancing AYO",
    "독서 아요": "Reading AYO",
    "울보 아요": "Teary AYO",
    "화난 아요": "Angry AYO",
    "사랑 아요": "Loving AYO",
    "손을 흔드는 밝은 아요": "A cheerful wave",
    "동그란 안경을 쓴 아요": "Wears round glasses",
    "기분 좋게 뛰노는 아요": "Dances with delight",
    "책을 읽는 아요": "Enjoys a good book",
    "눈물이 주르륵 아요": "Tears rolling down",
    "꼬리가 휙휙 화난 아요": "Tail flicking in anger",
    "하트 가득 사랑 아요": "Surrounded by hearts",
    "정면 하모": "Front-view HAMO",
    "반측면 하모": "Three-quarter HAMO",
    "옆모습 하모": "Side-view HAMO",
    "뒷모습 하모": "Back-view HAMO",
    "응원 하모": "Cheering HAMO",
    "행진 하모": "Marching HAMO",
    "진주 목걸이를 한 기본 하모": "Wears a pearl necklace",
    "살짝 몸을 돌린 하모": "Turns slightly",
    "얌전히 선 옆모습 하모": "Stands quietly in profile",
    "꼬리가 보이는 뒷모습 하모": "Shows off a tail",
    "깃발을 들고 달리는 하모": "Runs with a flag",
    "깃발을 높이 든 하모": "Raises a flag high",
    "옥가락지 논개": "Jade Ring Nongae",
    "결의의 논개": "Resolute Nongae",
    "사용 중": "Equipped",
    "사용하기": "Use Character",
    "코인이 부족하소!": "Not enough coins!",
    "✨ 아요+하모 특성 · 강한 비단 자동보정 · 상시 4단점프": "✨ AYO + HAMO perks · Strong Silk Stack assist · Always quadruple jump",
    "⚡ 레이싱 300km/h · 슈팅 이동↑ · 점프↑": "⚡ Racing at 300 km/h · Faster shooter movement · Better jumps",
    "🎯 수산·싹쓸이·떡떡떡·연타왕 판정↑ · 비단 자동보정": "🎯 Easier hits in Fish Market, Market Slice, Rice Cake & Tap King · Silk Stack assist",
    "점수·코인 기본 보상": "Base score and coin rewards",
    "🎯 현장 게임 획득 구역 7곳": "🎯 7 Market Game Stops",
    "시장 안에서 GPS로 게임을 모으세요. 실내 GPS가 불안정할 때는 QR 보조 해금을 이용할 수 있습니다.": "Collect games around the market using GPS. If the indoor signal is weak, use an on-site QR code.",
    "진주중앙시장 주차장": "Jinju Central Market Parking Area",
    "3구 어시장 인근 전부": "Zone 3 Fish Market Area",
    "중앙시장 2구통로 전체": "Central Market Corridor · Zone 2",
    "1구통로 전체": "Central Market Corridor · Zone 1",
    "뉴먹자골목 전부": "New Food Alley",
    "중앙시장 북쪽통로 전부": "North Market Corridor",
    "2층 3구 비단길 전체": "Bidan-gil, 2F · Zone 3",
    "주차장 구역에 들어오면 획득": "Unlock when you enter the parking area",
    "3구 어시장 인근 통로 범위에서 획득": "Unlock along the Zone 3 fish market corridor",
    "중앙시장 2구통로 구간에서 획득": "Unlock along the Zone 2 corridor",
    "중앙시장 1구통로 구간에서 획득": "Unlock along the Zone 1 corridor",
    "뉴먹자골목 구간에서 획득": "Unlock in New Food Alley",
    "북쪽통로 구간에서 획득": "Unlock along the northern market corridor",
    "비단길 건물 범위에 들어오면 획득": "Unlock in the Bidan-gil building",
    "✅ QR 보조 해금 완료": "✅ Unlocked by QR",
    "✅ GPS 자동 획득 완료": "✅ Unlocked by GPS",
    "▣ 현장 QR을 1회 스캔하면 이 위치가 GPS 기준점으로 저장됩니다.": "▣ Scan the on-site QR once to save this GPS reference point.",
    "🎯 획득 구역 안": "🎯 Inside Unlock Zone",
    "📡 GPS 확인을 시작하면 거리 표시": "📡 Start GPS to see distance",
    "QR획득": "QR Unlocked",
    "GPS획득": "GPS Unlocked",
    "GPS준비": "GPS Ready",
    "QR기준점": "QR Reference",
    "GPS 위치를 찾는 중입니다…": "Finding GPS location…",
    "GPS 위치를 찾는 중…": "Finding GPS location…",
    "위치 권한이 거부되었습니다. 브라우저의 이 사이트 위치 권한을 허용한 뒤 다시 누르소.": "Location permission denied. Allow location for this site in browser settings, then retry.",
    "현재 위치를 확인할 수 없습니다. 휴대폰의 위치 기능과 정밀 위치를 켠 뒤 다시 시도하소.": "Could not find your location. Enable your phone's location and precise location, then retry.",
    "GPS 응답 시간이 초과되었습니다. 잠시 뒤 다시 누르소.": "GPS timed out. Please try again.",
    "이 브라우저에서는 GPS 위치정보를 사용할 수 없습니다.": "GPS location isn't available in this browser.",
    "이 사이트의 위치 권한이 차단되어 있습니다. 브라우저 주소창의 사이트 설정에서 위치를 허용한 뒤 다시 누르소.": "Location access is blocked. Allow location in the browser's site settings and try again.",
    "GPS 실행에 실패했습니다. HTTPS 접속과 위치 권한을 확인한 뒤 다시 누르소.": "GPS could not start. Check HTTPS access and location permission, then retry.",
    "이 QR은 중앙시장 게임 QR이 아닙니다.": "This is not a Central Market game QR code.",
    "이 보너스 게임은 게임 진행 조건으로만 해금됩니다.": "This bonus game unlocks through in-game achievements only.",
    "GPS 확인을 시작하면 거리 표시": "Start GPS to see the distance",
    "잠긴 게임": "Locked Game",
    "장소 힌트": "Location Hint",
    "조건달성 필요": "Complete the Unlock Condition",
    "GPS 획득 필요": "Find the GPS Unlock Zone",
    "🔒 7개 게임 획득 시 해금": "🔒 Collect 7 Games to Unlock",
    "🔒 누적 500,000점 달성 시 해금": "🔒 Earn 500,000 Total Points",
    "🔒 누적 1,000,000점 달성 시 해금": "🔒 Earn 1,000,000 Total Points",
    "🔒 GPS/QR로 획득": "🔒 Unlock with GPS/QR",
    "장소 힌트 · 진주중앙시장 주차장": "Location hint · Jinju Central Market parking area",
    "장소 힌트 · 3구 어시장 인근 전체": "Location hint · Zone 3 fish market area",
    "장소 힌트 · 중앙시장 2구통로 전체": "Location hint · Market corridor, Zone 2",
    "장소 힌트 · 1구통로 전체": "Location hint · Market corridor, Zone 1",
    "장소 힌트 · 뉴먹자골목 전체": "Location hint · New Food Alley",
    "장소 힌트 · 중앙시장 북쪽통로 전체": "Location hint · North market corridor",
    "장소 힌트 · 2층 3구 비단길 전체": "Location hint · Bidan-gil, 2F, Zone 3",
    "장소 힌트 · 해금 조건 · 7개 게임 모두 획득": "Unlock condition · Collect all seven market games",
    "장소 힌트 · 해금 조건: 누적점수 500,000점 달성": "Unlock condition · Reach 500,000 total points",
    "장소 힌트 · 해금 조건 · 누적 1,000,000점 달성": "Unlock condition · Reach 1,000,000 total points",
    "아직 등록된 기록이 없습니다.": "No records yet.",
    "잠시 후 자동으로 돌아갑니다": "Returning shortly",
    "총점": "Total Score",
    "게임 목록": "Game List",
    "오소의 장바구니": "OSO's Shopping Basket",
    "상품을 받고 폭탄을 피하며 LEVEL 5까지 버티기": "Catch market goods, dodge bombs and survive to Level 5",
    "해금 위치: 진주중앙시장 주차장": "Unlock: Jinju Central Market parking area",
    "팔딱팔딱 수산시장": "Splashing Fish Market",
    "흐르는 물 속 생선을 잡고 물방울 콤보를 이어가기": "Catch swimming fish and chain bubble combos",
    "해금 위치: 3구 어시장 인근 전체": "Unlock: Zone 3 fish market area",
    "차곡차곡 비단쌓기": "Silk Stack Challenge",
    "좌우로 움직이는 비단 보를 정확히 쌓아 15단 완성": "Stack 15 shifting silk bundles with precise timing",
    "해금 위치: 중앙시장 2구통로 전체": "Unlock: Market corridor, Zone 2",
    "오소 장보기 RUN": "OSO Market Run",
    "2단점프 · GREAT 시 3단점프 · LV5 돌파": "Double jump; earn a triple jump with GREAT; clear Lv. 5",
    "해금 위치: 1구통로 전체": "Unlock: Market corridor, Zone 1",
    "시장 싹쓸이!": "Market Slice!",
    "시장 음식을 높이 띄워 시원하게 베기": "Slice market foods as they fly through the air",
    "해금 위치: 뉴먹자골목 전체": "Unlock: New Food Alley",
    "떡! 떡! 떡!": "Pound That Rice Cake!",
    "떡메를 들어 올려 절구의 떡을 힘껏 내려치기": "Time your mallet strikes to pound rice cakes",
    "해금 위치: 중앙시장 북쪽통로 전체": "Unlock: North market corridor",
    "파워덕질 1초 연타왕": "Powerduckjil 1-Second Tap King",
    "과일 5→수박 7→게임패드 10→큰 오락기 13→지구 16회를 1초에 연타해 반으로 부수기": "Tap 5, 7, 10, 13, then 16 times in one second to smash increasingly tough objects",
    "해금 위치: 2층 3구 비단길 전체": "Unlock: Bidan-gil, 2F, Zone 3",
    "오소 우주파이터": "OSO Space Fighter",
    "종스크롤 슈팅! 5스테이지를 질주하며 지구를 구하소": "Vertical shooter! Clear five stages and save Earth",
    "해금 조건 · 7개 게임 모두 획득": "Unlock: Collect all seven market games",
    "오소레이싱": "OSO Racing",
    "스크롤되는 진주 도로를 달리며 교통을 피하고 체크포인트를 돌파하소": "Race down Jinju's roads, dodge traffic and clear checkpoints",
    "해금 조건: 누적점수 500,000점 달성": "Unlock: Reach 500,000 total points",
    "오소 환상대모험": "OSO Fantasy Adventure",
    "중앙시장의 단서를 따라 보물상자를 찾고 던전과 보스를 돌파해 세계를 구하소": "Follow market clues, find treasure and defeat dungeon bosses",
    "해금 조건 · 누적 1,000,000점 달성": "Unlock: Reach 1,000,000 total points",
    "장바구니": "Basket",
    "수산시장": "Fish Market",
    "비단쌓기": "Silk Stack",
    "시장 싹쓸이": "Market Slice",
    "떡메치기": "Rice Cake Pounding",
    "파워덕질": "Powerduckjil",
    "7개를 모두 획득하면 오소 우주파이터": "Collect all seven to unlock OSO Space Fighter",
    "누적 500,000점이면 오소레이싱": "Reach 500,000 total points for OSO Racing",
    "누적 1,000,000점이면 오소 환상대모험": "Reach 1,000,000 total points for OSO Fantasy Adventure",
    "🏆 최고": "🏆 Best",
    "최고 기록": "Personal Best",
    "🔒 미해금": "🔒 Locked",
    "해금 완료": "Unlocked",
    "게임 획득": "Game Unlocked",
    "누적점수": "Total Points",
    "실패": "Failed",
    "성공": "Success",
    "다시하기": "Retry",
    "다시 시작": "Restart",
    "돌아가기": "Go Back",
    "선택하기": "Select",
    "구매하기": "Buy",
    "장착하기": "Equip",
    "보유중": "Owned",
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
  const allowed = new Set(["title", "aria-label", "placeholder", "alt"]);
  let language = (() => {
    try { const v = localStorage.getItem(KEY); if (v === "ko" || v === "en") return v; } catch (_) {}
    return /^en(?:-|$)/i.test(navigator.language || "") ? "en" : "ko";
  })();

  // Dynamic GPS/QR notices are presentation strings. Never modify zone geometry or game save data.
  const formatGps = (center, locale) => {
    let m;
    const toEnglish = value => LABELS[value] || value;
    const toKorean = value => reverse.get(value) || value;
    if (locale === "en") {
      if ((m = center.match(/^📍 (.+)$/))) {
        const name = toEnglish(m[1]); return name === m[1] ? null : "📍 " + name;
      }
      if ((m = center.match(/^GPS 작동 중 · 정확도 약 ±(\d+)m$/))) return "GPS active · Accuracy ±" + m[1] + "m";
      if ((m = center.match(/^GPS 위치 확인 중 · 정확도 약 ±(\d+)m$/))) return "Checking GPS · Accuracy ±" + m[1] + "m";
      if ((m = center.match(/^GPS 신호가 너무 약합니다 \(±(\d+)m\). 잠시 이동하거나 하늘이 보이는 곳에서 다시 확인하소\.$/))) return "GPS signal too weak (±" + m[1] + "m). Move closer to an open area and try again.";
      if ((m = center.match(/^📡 획득 구역까지 약 (\d+)m$/))) return "📡 About " + m[1] + "m to unlock zone";
      if ((m = center.match(/^(.+) 획득구역이 가까워졌소!$/))) return "Unlock zone for " + toEnglish(m[1]) + " is nearby!";
      if ((m = center.match(/^(.+) 방향 · 약 (\d+)m$/))) return "Toward " + toEnglish(m[1]) + " · about " + m[2] + "m";
      if ((m = center.match(/^(.+) QR 확인 · 이 위치를 GPS 기준점으로 저장했소!$/))) return toEnglish(m[1]) + " QR verified · GPS reference saved!";
      if ((m = center.match(/^(.+) QR 확인 완료! · GPS 기준점도 저장했소\.$/))) return toEnglish(m[1]) + " QR verified · GPS reference also saved.";
      if ((m = center.match(/^(.+) QR 확인 완료!$/))) return toEnglish(m[1]) + " QR verified!";
      if ((m = center.match(/^(.+)은 이미 획득했소!$/))) return toEnglish(m[1]) + " is already unlocked!";
    } else {
      if ((m = center.match(/^📍 (.+)$/))) {
        const name = toKorean(m[1]); return name === m[1] ? null : "📍 " + name;
      }
      if ((m = center.match(/^GPS active · Accuracy ±(\d+)m$/))) return "GPS 작동 중 · 정확도 약 ±" + m[1] + "m";
      if ((m = center.match(/^Checking GPS · Accuracy ±(\d+)m$/))) return "GPS 위치 확인 중 · 정확도 약 ±" + m[1] + "m";
      if ((m = center.match(/^GPS signal too weak \(±(\d+)m\). Move closer to an open area and try again\.$/))) return "GPS 신호가 너무 약합니다 (±" + m[1] + "m). 잠시 이동하거나 하늘이 보이는 곳에서 다시 확인하소.";
      if ((m = center.match(/^📡 About (\d+)m to unlock zone$/))) return "📡 획득 구역까지 약 " + m[1] + "m";
      if ((m = center.match(/^Unlock zone for (.+) is nearby!$/))) return toKorean(m[1]) + " 획득구역이 가까워졌소!";
      if ((m = center.match(/^Toward (.+) · about (\d+)m$/))) return toKorean(m[1]) + " 방향 · 약 " + m[2] + "m";
      if ((m = center.match(/^(.+) QR verified · GPS reference saved!$/))) return toKorean(m[1]) + " QR 확인 · 이 위치를 GPS 기준점으로 저장했소!";
      if ((m = center.match(/^(.+) QR verified · GPS reference also saved\.$/))) return toKorean(m[1]) + " QR 확인 완료! · GPS 기준점도 저장했소.";
      if ((m = center.match(/^(.+) QR verified!$/))) return toKorean(m[1]) + " QR 확인 완료!";
      if ((m = center.match(/^(.+) is already unlocked!$/))) return toKorean(m[1]) + "은 이미 획득했소!";
    }
    return null;
  };
  const formatLabel = (center, locale) => {
    let match;
    if (locale === "en") {
      if ((match = center.match(/^🪙 ([\d,]+) 구입$/))) return `🪙 Buy for ${match[1]}`;
      if ((match = center.match(/^⭐ 점수·코인 \+(\d+)%$/))) return `⭐ Score and coins +${match[1]}%`;
      if ((match = center.match(/^🏆 최고 ([\d,]+)$/))) return `🏆 Best ${match[1]}`;
      if ((match = center.match(/^누적점수 ([\d,]+)점$/))) return `Total Score ${match[1]} pts`;
      if ((match = center.match(/^([\d,]+)점$/))) return `${match[1]} pts`;
    } else {
      if ((match = center.match(/^🪙 Buy for ([\d,]+)$/))) return `🪙 ${match[1]} 구입`;
      if ((match = center.match(/^⭐ Score and coins \+(\d+)%$/))) return `⭐ 점수·코인 +${match[1]}%`;
      if ((match = center.match(/^🏆 Best ([\d,]+)$/))) return `🏆 최고 ${match[1]}`;
      if ((match = center.match(/^Total Score ([\d,]+) pts$/))) return `누적점수 ${match[1]}점`;
      if ((match = center.match(/^([\d,]+) pts$/))) return `${match[1]}점`;
    }
    return formatGps(center, locale);
  };
  const lookup = (text, locale) => {
    const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
    if (!match) return text;
    const center = match[2];
    const ko = Object.prototype.hasOwnProperty.call(LABELS, center) ? center : reverse.get(center);
    const next = ko ? (locale === "en" ? LABELS[ko] : ko) : (formatLabel(center, locale) || center);
    return match[1] + next + match[3];
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
    if (root.nodeType === Node.ELEMENT_NODE && root.closest(ignored)) return;
    translateNode(root);
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    while (walker.nextNode()) translateNode(walker.currentNode);
  }

  let originalManual = null;
  const englishManual = `
    <h3>1. Collect games around Jinju Central Market</h3>
    <p><b>GPS auto-unlock</b> is the main way to collect games. Allow location access while using the game. Enter each designated area to receive a GAME GET notification. GPS may be inaccurate inside the market, so use <b>Unlock with QR</b> in Market Exploration to scan an on-site QR code instead. Once collected, a game stays unlocked on this device.</p>
    <h3>2. Play seven market mini-games</h3>
    <p><b>OSO's Shopping Basket:</b> move left and right, catch goods and avoid bombs.<br>
    <b>Splashing Fish Market:</b> tap fish and build combos.<br>
    <b>Silk Stack Challenge:</b> precisely stack 15 silk bundles.<br>
    <b>OSO Market Run:</b> double jump; earn a one-time triple jump with GREAT.<br>
    <b>Market Slice:</b> swipe to slice flying food.<br>
    <b>Pound That Rice Cake:</b> strike at the right moment.<br>
    <b>Powerduckjil Tap King:</b> tap as fast as you can in one second.</p>
    <h3>3. Unlock three bonus adventures</h3>
    <p>Collect all seven market games for <b>OSO Space Fighter</b>. Earn <b>500,000 total points</b> to unlock OSO Racing, and <b>1,000,000 total points</b> to unlock OSO Fantasy Adventure.</p>
    <h3>4. Levels and coins</h3>
    <p>Most mini-games become faster and more challenging as you advance from <b>Level 1 to Level 5</b>. Reach coin milestones of 1,000 / 5,000 / 10,000 / 20,000 / 30,000 / 40,000 / 50,000 / 100,000 to see a celebration.</p>
    <h3>5. Market map and GPS</h3>
    <p>The external GrowMaps map shows actual locations. This game does not invent unverified shops or landmarks. Check each game's details for where to unlock it, then use Market Exploration for GPS status and the market map link.</p>
    <p><b>Tip:</b> Try an on-site QR code if your GPS position jumps indoors.</p>`;
  function renderManual() {
    const pane = document.querySelector("#manualModal .manualScroll");
    if (!pane) return;
    if (originalManual === null) {
      originalManual = pane.innerHTML;
      pane.setAttribute("data-oso-no-translate", "");
    }
    const next = language === "en" ? englishManual : originalManual;
    if (pane.innerHTML !== next) pane.innerHTML = next;
  }
  function repaint() {
    renderManual();
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
    bar.innerHTML = '<button type="button" data-oso-language="ko" lang="ko">한국어</button><button type="button" data-oso-language="en" lang="en">English</button>';
    bar.addEventListener("click", event => {
      const btn = event.target.closest("button[data-oso-language]");
      if (btn) setLanguage(btn.dataset.osoLanguage);
    });
    title.appendChild(bar);
  }
  const style = document.createElement("style");
  style.textContent = '.oso-language-switch{position:absolute;right:6px;top:4px;display:flex;gap:3px;z-index:120;pointer-events:auto;background:#fffbee;border:2px solid #765037;border-radius:99px;padding:3px;box-shadow:0 2px 5px #0002}.oso-language-switch button{border:0;border-radius:99px;min-height:40px;padding:4px 10px;touch-action:manipulation;pointer-events:auto;background:transparent;color:#765037;font-size:11px;font-weight:900;line-height:1.1}.oso-language-switch button:focus-visible{outline:2px solid #392216;outline-offset:-2px}.oso-language-switch button.active{background:#ffc928;color:#392216}';
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
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...allowed] });
  }
  window.OSO_I18N = Object.freeze({
    t: (key, fallback) => language === "en" ? (LABELS[key] || fallback || key) : key,
    getLanguage: () => language,
    setLanguage,
    format: value => lookup(value, language),
    getTranslationKeys: () => Object.keys(LABELS)
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();