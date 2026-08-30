# 어서오소! 중앙시장 게임장 RETRO — GBA

웹 완성판과 분리된 GBA 이식 프로젝트다. `main`의 웹 파일은 수정하지 않고 `retro-gba` 브랜치에서만 작업한다.

## Phase 1 구현 범위

- GBA 240×160 가로 화면 기반
- 어트랙트 루프: SPLASH → TITLE → RANKING → DEMO 1 → 반복, 데모 번호는 1~7 순환
- DEMO 1은 실제 장바구니 엔진을 스크립트 입력으로 재생하며 저장 데이터를 변경하지 않음
- 게임 선택 화면: 최초 GAME 1만 해금
- 누적 점수에 따른 순차 해금 엔진 + SRAM 영구 저장 + 체크섬
- 장바구니 1차 가로 이식: D-PAD 좌우 이동, 폭탄/상품/코인, 점수/콤보/5 LIFE
- 22,050 Hz Direct Sound A PCM 타이밍 경로 + DMA1/Timer0 기반 짧은 PCM SFX
- Drill Dozer 계열 Game Pak GPIO 진동 + LIGHT/MEDIUM/HEAVY/DOUBLE/CRASH/SUCCESS 패턴
- MiSTer/Analogue Pocket 호환 코어/rumble accessory/EZ-FLASH ODE 등 Drill Dozer rumble을 구현하는 환경을 주 타깃으로 함

## 아직 고정하지 않은 것

- GAME 2~7 실제 플레이 이식
- 최종 한글 도트 UI/원본 이미지 변환
- 22.05 kHz BGM 스트리밍 믹서와 최종 음원
- 최종 누적점수 해금 기준값 (현재 값은 엔진 동작 검증용 임시값)
- 장비별 실기 rumble QA

© 파워덕질 2026
