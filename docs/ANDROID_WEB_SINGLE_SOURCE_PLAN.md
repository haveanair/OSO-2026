# 어서오소! 관광게임 — Web + Android 단일 소스 개발계획

## 원칙
- **유일한 게임 원본:** `play/index.html` 및 `play/` 하위의 리소스. 웹과 Google Play Android 앱 모두 이 HTTPS 게임을 사용한다.
- **앱 외피:** TWA(Trusted Web Activity), Bubblewrap로 AAB 생성. 기존 로컬 WebView APK 방식은 재사용하지 않는다.
- **운영 안전성:** 실사용 `main` 웹페이지는 기능검증 전 변경하지 않는다. 먼저 개발 브랜치에서 작업한다.
- **검증 필수:** Android Chrome 및 삼성 브라우저에서 GPS·QR·카메라·뒤로가기·데이터보존·전체화면·오디오를 테스트한다.

## 2026-11-16 착수: 구현됨
1. `play/oso-i18n.js`: 한국어/영어 선택 및 로컬 저장, 일부 타이틀·메뉴·탐험·QR·설명 문자열 번역. 동적 모든 게임 대사는 아직 미번역이다.
2. `play/manifest.webmanifest`: PWA 설치 설명 및 시작 URL. 안드로이드 스토어 패키징을 위한 **PNG 192×192, 512×512 및 maskable 아이콘**은 추가 제작 및 확인 필요.
3. `play/icons/oso-icon.svg`: 현재 게임의 승인된 오소 이미지를 기반으로 한 SVG 초안.
4. `play/index.html`: 별도 번역 스크립트와 manifest 로드. GPS 해금 좌표·점수·게임 저장키는 수정하지 않음.

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
