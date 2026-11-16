# 어서오소! Google Play TWA 출시 준비 — 개인 개발자

## 동일 게임 소스 유지
- 기준 게임: `play/index.html`, `play/` 자산과 번역 파일.
- 웹: `https://haveanair.github.io/OSO-2026/play/`
- Android: 위 HTTPS 주소를 TWA(Trusted Web Activity)로 여는 패키지.
- 게임 업데이트는 웹 배포 하나로 공통 적용. **Android SDK, 권한, 런처 아이콘, 버전 코드, 앱 서명 변경은 새 AAB 출시 필요.**
- 브라우저 데이터와 설치 앱 데이터는 기기·브라우저 프로필에 따라 달라질 수 있어 자동 동기화를 보장할 수 없다.

## 아직 해결해야 하는 출시 차단 사항
1. **출시용 웹 배포:** 지금은 개발 브랜치에서 작업하며 기본 GitHub Pages URL은 `main`을 제공한다. 번역/QA 검증 후 병합하고 manifest와 PWA가 실제 HTTPS에서 제공되는지 확인한다.
2. **도메인 검증:** Digital Asset Links는 반드시 `https://haveanair.github.io/.well-known/assetlinks.json`에서 제공되어야 한다. 프로젝트 하위의 `/OSO-2026/.well-known/`이 아니다. 이 도메인의 루트 GitHub Pages 사이트 소유권 관리가 가능해야 한다. 별도 소유 도메인 사용도 가능.
3. **개인 개발자 계정과 앱 서명:** Play Console에 앱을 만들고 정식 **Play 앱 서명 인증서 SHA-256**을 확보해야 한다. 업로드용 서명키 SHA-256을 잘못 기입하면 Play 설치판의 전체화면 검증이 실패할 수 있다.
4. **Android targetSdkVersion:** 2026-08-31부터 새 모바일 게임은 API 36 이상 필수. Bubblewrap이 생성한 Android 프로젝트의 `targetSdkVersion >=36` 검증.
5. **GPS 및 카메라 실기기 검증:** 위치 요청, QR 카메라, 권한 거절, 지하·실내 위치 오차, 뒤로 가기, 잠자기/복귀, 온라인/오프라인 안내, 기록 유지 테스트.
6. **Google Play 제출:** 테스트 트랙, 개인정보처리방침, 데이터 보안, 콘텐츠 등급, 위치정보 고지, 스토어 스크린샷, 게임 설명 준비. 신규 개인 개발자 계정의 비공개 테스트 요건을 확인한다.

## Bubblewrap 패키징 절차
*반드시 메인 웹버전에 매니페스트가 배포된 다음 실행.* 먼저 `https://haveanair.github.io/OSO-2026/play/manifest.webmanifest`이 200 OK로 열리는지 확인한다.

```bash
npm install --global @bubblewrap/cli
mkdir oso-android
cd oso-android
bubblewrap init --manifest=https://haveanair.github.io/OSO-2026/play/manifest.webmanifest
# 실행 중 패키지 ID와 앱 이름을 확인. 패키지 ID는 정식 등록 후 변경하기 어렵다.
# Android SDK/JDK 설정, 서명키 생성과 비밀번호 백업을 안전하게 마친다.
bubblewrap build
# 기본 결과:
# app-release-signed.apk    : 직접 실기기 테스트용
# app-release-bundle.aab    : Google Play 업로드용
```

- Bubblewrap 결과물의 `twa-manifest.json`에서 `startUrl`이 `/OSO-2026/play/` 범위인지 확인.
- 패키지 ID는 **사용자 확정 후** 정한다. 예시 값으로 Play에 등록하지 않는다.
- Play 앱 서명 인증서의 실제 SHA-256과 최종 패키지 ID로 `android/assetlinks.example.json`을 완성하여 **도메인 루트**에 `assetlinks.json`으로 게시.
- GitHub Pages/Jekyll이 숨김 폴더를 제외하면 사이트 루트 `_config.yml`에 `include: [.well-known]`을 설정.
- 전체화면 대신 URL 표시줄이 나타난다면 우선 Digital Asset Links 검증, 앱 서명 SHA, 최종 도메인 일치 여부를 점검.
- 설치·로그 테스트: `adb install app-release-signed.apk` 후 `adb logcat -v brief | grep -e OriginVerifier -e digital_asset_links`.
- 업로드 키와 인증서 개인키를 **GitHub 저장소에 절대 커밋하지 않는다.**

## 품질 점검
- 정적·번역 테스트: `node tests/oso-unit.mjs`
- 브라우저 모바일 화면 검증: `node tests/oso-tourism-smoke.mjs` (Playwright, 현지 테스트 환경)
- 현장검증 표본: 한국어/English, 안드로이드 소형·대형 화면, GPS 7개 구역, QR 보조, 10종 게임 클리어·게임오버·도감·엔딩.
- 완료 기준: 웹·앱 동일 소스, 실기기 기능 검증 통과, 소유권 검증 완료, API 36 이상, AAB 파일 생성 및 내부 테스트 트랙에서 설치 확인.

## 공식 자료
- https://developer.chrome.com/docs/android/trusted-web-activity/quick-start/
- https://developer.chrome.com/docs/android/trusted-web-activity/integration-guide/
- https://developer.chrome.com/docs/android/trusted-web-activity/android-for-web-devs/
- https://github.com/GoogleChromeLabs/bubblewrap/tree/main/packages/cli
- https://support.google.com/googleplay/android-developer/answer/11926878
