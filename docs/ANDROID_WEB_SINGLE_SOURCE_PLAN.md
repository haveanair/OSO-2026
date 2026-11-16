# 어서오소! 관광게임 — Web + Android 단일 소스 개발계획

## 원칙
- **유일한 게임 원본:** `play/index.html` 및 `play/` 하위의 리소스. 웹과 Google Play Android 앱 모두 이 HTTPS 게임을 사용한다.
- **앱 외피:** TWA(Trusted Web Activity), Bubblewrap로 AAB 생성. 기존 로컬 WebView APK 방식은 재사용하지 않는다.
- **운영 안전성:** 실사용 `main` 웹페이지는 기능검증 전 변경하지 않는다. 먼저 개발 브랜치에서 작업한다.
- **검증 필수:** Android Chrome 및 삼성 브라우저에서 GPS·QR·카메라·뒤로가기·데이터보존·전체화면·오디오를 테스트한다.

## 2026-11-16 착수: 구현됨
1. `play/oso-i18n.js`: 한국어/영어 선택 및 로컬 저장, 타이틀·메뉴·탐험·QR·10종 게임의 명칭/설명/해금 조건, 영어 플레이 매뉴얼을 번역. 동적 모든 게임 대사는 아직 미번역이다.
2. `play/manifest.webmanifest`: PWA 설치 설명 및 시작 URL. 기존 승인된 오소 아트로 만든 **PNG 192×192, 512×512 및 maskable 512×512 아이콘**을 확인하여 등록했다.
3. `play/icons/oso-icon.svg`: 현재 게임의 승인된 오소 이미지를 기반으로 한 SVG 초안.
4. `play/index.html`: 별도 번역 스크립트와 manifest, 서비스워커 로드. GPS 해금 좌표·점수·게임 저장키는 수정하지 않음.
5. `play/sw.js`: 온라인 우선·오프라인 재접속 안내 및 이미 불러온 핵심 자원 캐시. 오프라인 전체 게임 품질은 현장검증 전까지 보장하지 않음.
6. `tools/build_oso_icons.py`: HTML 안 기존 오소 이미지를 PNG 앱 아이콘으로 변환. `.github/workflows/oso-icons.yml`을 통해 개발 브랜치에 출력됨.
7. `tests/oso-tourism-smoke.mjs`: 한영 전환·10종 제목·매뉴얼·게임 목록·아이콘 로딩을 확인하는 Chromium 자동 테스트 코드. `.github/workflows/oso-smoke.yml` 실행 결과 확인 전까지는 **테스트 통과를 주장하지 않음**.

## 로드맵
### A. 번역 완성
- 게임 이름 10종, 설명, 모든 팝업, 각 게임의 타이틀/튜토리얼/게임오버/진엔딩/수집·구매·랭킹 동적 문자열을 `OSO_I18N.t()` 호출 또는 메시지 키 기반 시스템으로 정리.
- 문장이 길어 영어 UI에서 말줄임이 발생하지 않게 조정; 언어 전환 시 게임 상태는 변하지 않아야 함.
- 영어권 방문객과 한국어 사용자에게 각각 동작 점검.

### B. PWA / 네트워크
- Android Chrome에서 installability, 오프라인/약한 통신 대비, 캐시 갱신 전략 검증.
- 인터넷 연결이 없으면 현재 GPS 게임이 정상 구동되는지 검증되기 전까지 오프라인을 보장한다고 안내하지 않음.
- 브라우저 및 앱의 로컬 저장소가 동일한지 브라우저별로 테스트. 다른 저장소로 옮기는 경우 내보내기/복구 필요.

### C. TWA / Android 앱
- `npm install -g @bubblewrap/cli`
- 한국어/영어가 반영된 공개 HTTPS manifest URL로 `bubblewrap init --manifest <URL>`
- Play App Signing 인증서 SHA-256을 확정한 다음, 서비스 도메인의 **루트**에 `https://<HOST>/.well-known/assetlinks.json` 게시.
- 기존 프로젝트 페이지는 `https://haveanair.github.io/OSO-2026/play/`이므로 `/OSO-2026/.well-known/assetlinks.json`에 두는 것은 인증에 충분하지 않음. `haveanair.github.io` 사용자 페이지 루트 또는 사용자 소유의 별도 HTTPS 도메인 마련 필요.
- 게임 설정/도움말/앱 기능까지 포함해 플랫폼 정책의 의미 있는 기능·안정성 기준 확인.
- Android API target 등 최신 Play 요구 사항에 맞춰 AAB 빌드.

### D. 운영 테스트
- 실기기에서 한국어/English, 관광지 GPS, QR 스캔, 카메라 권한, 뒤로가기, 앱 재개, 사운드, 네트워크 오류, 저장 데이터, 기기 회전, 세로/가로 UI 점검.
- 신규 개인 개발자 계정의 비공개 테스트 조건과 스토어 등록자료·위치정보 고지·개인정보처리방침 확인.

## 업데이트 정책
- **웹 콘텐츠·게임 로직·번역:** 단일 `play/` 배포로 웹과 TWA 앱에 동시 반영될 수 있음. 사용자 브라우저 캐시로 실제 반영 시간은 다를 수 있음.
- **Android 자체 기능(앱 ID·권한·아이콘·앱 외피·SDK):** 새 AAB와 플레이스토어 업데이트 필요.
- **접근 불가 시:** 첫 접속/네트워크 단절 및 서비스 URL 변경으로 앱이 화면을 불러오지 못할 수 있음. 추후 오프라인 대기 화면/재시도 등 보강할 것.

## 검증 참고 자료
- https://developer.chrome.com/docs/android/trusted-web-activity/
- https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2
- https://support.google.com/googleplay/android-developer/answer/9898783

## 2026-11-16 정적 검증
- 10개 게임의 이름·설명·해금 정보 모두 영어 사전에 존재함을 확인.
- PNG 아이콘 3종의 실제 파일 존재 및 PNG 헤더·해상도 확인.
- 기존 main과 비교했을 때 GPS_DEFAULTS, GAMES 원본 목록, localStorage 저장 함수가 동일함을 확인.
- 번역 스크립트와 서비스워커 JavaScript 문법 검사 통과. 브라우저 렌더링 및 실기기 GPS/QR은 별개 검증 필요.

## 2026-11-16 3차 진행 (개발 브랜치에서만 적용)
- `play/oso-game-i18n.js`: `#stage` 내부의 안내·결과·보너스와 주요 RPG 메뉴를 게임 상태 변경 없이 번역하도록 별도 모듈로 분리. `oso:languagechange` 이벤트로 한국어 복원을 지원한다.
- 게임 선택창의 잠금 상태·GPS 장소 힌트·동적으로 생성되는 누적 점수·신기록도 번역 범위를 확장했다.
- `play/sw.js` 온라인 우선 캐시가 새 번역 모듈을 포함하도록 캐시 버전을 갱신했다.
- `tests/oso-unit.mjs`: 10종 게임 이름/설명/해금 영어 사전, 게임 결과 문구, PWA PNG 파일을 검증하는 Node 테스트 추가.
- `tests/oso-tourism-smoke.mjs`: 게임 스테이지에 결과 레이아웃을 만들어 한국어→영어→한국어 전환을 확인하는 브라우저 테스트 추가.
- `android/TWA_RELEASE_CHECKLIST.md`, `android/assetlinks.example.json`: 개인 개발자 출시 경로·도메인 루트의 Digital Asset Links·API36 요구사항과 미입력값 정리.
- **확인된 것:** 번역 모듈 초기화·대표 문구 변환·언어 상태 전환의 독립적인 JavaScript 검증과 파일 무결성 확인.
- **확인되지 않은 것:** Android 실기기 GPS/QR/뒤로가기, 전체 RPG 대사 완전 번역, AAB 생성, Google Play 소유권 검증·출시.

## 자동 테스트 확인 결과 (2026-11-16)
- GitHub Actions [OSO bilingual mobile smoke test #43779770239](https://github.com/haveanair/OSO-2026/actions/runs/43779770239): `unit` ✅ 성공, `browser-smoke` ✅ 성공.
- 브라우저 검사: 실제 타이틀 한국어/English 토글, 게임 결과 화면 영어화 및 원복, 10종 번역 사전, 잠긴 GPS 게임의 설명·해금 안내, PWA 설치 아이콘 URL 확인.
- 잠긴 게임의 이름이 `???`로 표시되는 기존 GPS 해금 규칙은 변경하지 않음.
- 영어 UI 좁은 화면을 위한 `play/oso-i18n.css`를 추가했으며, 런타임 로딩은 정적 회귀검사에서 확인됨.
- 테스트는 CI Chromium 기반 자동 검증이며 실제 관광 현장 GPS/QR 기능 검증 및 플레이스토어 AAB 출시 검증과는 구별함.

## 4차 RPG 영어화 (2026-11-16)
- `play/oso-rpg-strings.js`: 주민 대화, 상점, 던전, 장비, 적과 보스 대사 159개 항목의 전용 영어 사전.
- `play/oso-game-i18n.js`: 실시간 RPG 장면 `.fantasyWrap`의 동적 텍스트에도 번역 적용. RUN 점프 횟수, 실크 쌓기, 우주파이터 초필살기 게이지도 영어 표시.
- `play/index.html`: RPG 사전을 번역 엔진보다 먼저 로드. GPS 좌표, 점수 계산식, 게임 저장키 변경 없음.
- `play/sw.js`: RPG 사전 및 최신 번역 엔진을 오프라인 캐시에 포함.
- `tests/oso-unit.mjs`: RPG 본편에서 추출할 수 있는 **고정 한국어 문자열 151개**가 영어 번역 사전에 모두 존재하는지 자동 전수검사. 동적 문자열·표현식 안의 일부 대사는 대상에 포함되지 않는다.
- `tests/oso-tourism-smoke.mjs`: 실제 Chromium에서 RPG NPC 대화·전투 메시지·퀘스트 안내·장비명 영어 번역 및 한국어 복원 테스트.
- Chromium + Node 회귀검사 모두 통과한 실행: [GitHub Actions #43786230527](https://github.com/haveanair/OSO-2026/actions/runs/43786230527).
- **남은 작업:** RPG 동적 스토리 대사/전투 상태 및 보너스게임 전체 영문 감수, 관광 현장의 7개 GPS 구역과 QR 실기기 검증, 앱 서명/도메인 인증 후 실제 AAB 제작.

## 5차 RPG 동적 번역 및 6차 관광 GPS 품질 검증 (2026-11-16)
- `play/oso-rpg-dynamic.js`: RPG의 NPC 이름+대사, 보스 공격 피해량, 적 격파 보상, 퀘스트 목표, 워프 문구, 코인·장비 상태 등 **값이 바뀌는 문장 패턴**을 실시간 영어화. 게임 저장 구조·조작·점수 계산식 수정 없음.
- `play/oso-rpg-strings.js`: RPG 후반 스토리, NPC 이름, 챕터 엔딩의 한국어 문장 조각을 보완. 고정/동적 문구를 혼합한 대사는 끝까지 감수가 필요함.
- `play/index.html`: 기존 `renderGpsLocations()`가 찾던 `#locationList`를 시장 탐험 화면에 실제로 추가. 현장 7개 게임 구역 표시 기능을 복구.
- `play/oso-i18n.js`: GPS 구역명/위치 힌트 7개, GPS 거리 및 정확도, 현장 QR 안내·해금 결과를 양방향 번역.
- `play/oso-i18n.css`: 작은 화면에서도 위치 목록·영어 텍스트가 줄바꿈하도록 보완.
- `play/sw.js`: 신규 RPG 동적 번역 스크립트를 캐시 대상에 추가.
- 자동 검사: **Node unit 성공 + Chromium browser-smoke 성공** [GitHub Actions #43790787153](https://github.com/haveanair/OSO-2026/actions/runs/43790787153).
- 브라우저 자동검사 내용: 번역 전환·재전환, RPG 대표 동적 문구, 현장 게임 7개 해금 좌표를 가상 위치로 순차 이동해 7개 모두 해금 및 우주파이터 조건해금, QR 파싱·보조 해금·보너스 QR 우회 거부, 오프라인 재시작 시 캐시 HTML 사용.
- **검증 경계:** 실제 시장 내부 GPS 정확도 및 Android TWA 실기기 카메라/뒤로가기/상용 배포는 아직 테스트하지 않음. QR 테스트는 기존 QR 해금 파서에 가짜 QR 문자열을 주입한 기능 검사이며 카메라 촬영 검사가 아님.
- **기존 운영 판 보호:** `main`의 `play/index.html`은 수정하지 않음. 개발 브랜치와 main의 `GPS_DEFAULTS`, `GAMES`, `load/save`, 기본/보너스 게임 해금 코드와 RPG 게임 계산 로직 주요 원문이 동일함을 비교 확인.
