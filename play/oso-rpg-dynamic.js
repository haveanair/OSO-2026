/* OSO Fantasy Adventure: dynamic Korean->English display formatting.
 * Input is presentation text only. No game stats, saves, coordinates, rewards or IDs change.
 * Called only from the visible-text localization layer.
 */
(() => {
  "use strict";
  if (window.OSO_RPG_DYNAMIC) return;

  function translate(raw, known = value => value) {
    if (typeof raw !== "string" || !/[가-힣]/.test(raw)) return raw;
    const named = value => {
      const result = known(value);
      return result === value ? value : result;
    };
    let m;
    // Dialogue uses "NPC name: dialogue" while its name and line are kept in Korean
    // internally so NPC interactions and save-state IDs are not modified.
    if ((m = raw.match(/^([^:\n]{1,40}):\s*([\s\S]+)$/))) {
      const name = named(m[1]);
      const fixedLine = named(m[2]);
      const line = fixedLine === m[2] ? translate(m[2], known) : fixedLine;
      if (name !== m[1] || line !== m[2]) return name + ": " + line;
    }
    // RPG NPC dialogue after all three major bosses have been defeated.
    if ((m = raw.match(/^(오소용사|하모용사|아요용사), 마왕과 암흑영웅장군을 넘어 대천사 논개의 봉인까지 풀어냈군\. 이제야 진주의 하늘과 땅이 함께 평온해졌네\.$/))) {
      return named(m[1]) + ", you've defeated the Demon King and Dark Hero General, then broken Archangel Nongae's seal. At last, peace has returned to Jinju.";
    }

    // Location guidance, quest counters, and warps.
    if ((m = raw.match(/^이 지역의 강적을 ([\d,]+)번 더 물리치시오\.$/))) return "Defeat " + m[1] + " more powerful enemies in this area.";
    if ((m = raw.match(/^(.+)에게 도전하시오\.$/))) return "Challenge " + named(m[1]) + ".";
    if ((m = raw.match(/^(.+)\(으\)로 이동하시오\.$/))) return "Travel to " + named(m[1]) + ".";
    if ((m = raw.match(/^(.+)의 워프진이 중앙시장과 연결됐다!$/))) return "The " + named(m[1]) + " warp is now linked to Central Market!";
    if ((m = raw.match(/^(.+)의 보스 인근 워프로 돌아왔다\.$/))) return "Returned to the warp near the " + named(m[1]) + " boss.";
    if ((m = raw.match(/^(.+) · 현재 위치$/))) return named(m[1]) + " · You Are Here";

    // Battle logs are regenerated every round; translate only the displayed line.
    if ((m = raw.match(/^(.+)이\(가\) 나타났다!$/))) return named(m[1]) + " appeared!";
    if ((m = raw.match(/^(.+)의 공격! ([\d,]+) 피해!$/))) return named(m[1]) + " attacks! " + m[2] + " damage!";
    if ((m = raw.match(/^(.+)! ([\d,]+) 피해!$/))) return named(m[1]) + "! " + m[2] + " damage!";
    if ((m = raw.match(/^(.+)을\(를\) 물리쳤다! EXP ([\d,]+) 획득!$/))) return "Defeated " + named(m[1]) + "! Earned " + m[2] + " EXP!";
    if ((m = raw.match(/^(.+) 격파 보상! 🪙 \+([\d,]+)$/))) return named(m[1]) + " victory reward! 🪙 +" + m[2];
    if ((m = raw.match(/^([^\n]+) · ([\d,]+) HIT FINISH! · 총 ([\d,]+) 피해!$/))) return named(m[1]) + " · " + m[2] + " HIT FINISH! · " + m[3] + " total damage!";
    if ((m = raw.match(/^([^\n]+) · ([\d,]+) \/ ([\d,]+) HIT · 누적 ([\d,]+) 피해!$/))) return named(m[1]) + " · " + m[2] + "/" + m[3] + " HIT · " + m[4] + " total damage!";
    if ((m = raw.match(/^([^\n]+) · ([\d,]+)연쇄 HIT! · 총 ([\d,]+) 피해!$/))) return named(m[1]) + " · " + m[2] + "-hit combo! · " + m[3] + " damage!";
    if ((m = raw.match(/^([^\n]+) · ([\d,]+) \/ ([\d,]+) 연쇄타격 · 누적 ([\d,]+) 피해!$/))) return named(m[1]) + " · " + m[2] + "/" + m[3] + " combo hits · " + m[4] + " damage!";
    if ((m = raw.match(/^([^\n]+) ([\d,]+) 피해!$/))) return named(m[1]) + " " + m[2] + " damage!";
    if ((m = raw.match(/^(.+)!([ ]?) 약점을 찔렀다!$/))) return named(m[1]) + "! It's super effective!";
    if ((m = raw.match(/^(.+) 습득!$/))) return "Learned " + named(m[1]) + "!";

    // Inventory, shops and status screen (numerical values stay untouched).
    if ((m = raw.match(/^HP ([\d,]+) · MP ([\d,]+) · TP ([\d,]+) 회복$/))) return "Restored HP " + m[1] + " · MP " + m[2] + " · TP " + m[3];
    if ((m = raw.match(/^공격 ([\d,]+) · 방어 ([\d,]+)$/))) return "ATK " + m[1] + " · DEF " + m[2];
    if ((m = raw.match(/^공격 \+([\d,]+) · 방어 \+([\d,]+)$/))) return "ATK +" + m[1] + " · DEF +" + m[2];
    if ((m = raw.match(/^공격 \+([\d,]+)$/))) return "ATK +" + m[1];
    if ((m = raw.match(/^방어 \+([\d,]+)$/))) return "DEF +" + m[1];
    if ((m = raw.match(/^무기: (.+)$/))) return "Weapon: " + named(m[1]);
    if ((m = raw.match(/^방어구: (.+)$/))) return "Armor: " + named(m[1]);
    if ((m = raw.match(/^장신구: (.+)$/))) return "Accessory: " + named(m[1]);
    if ((m = raw.match(/^기본 ([\d,]+) \+ 무기 ([\d,]+) \+ 장신구 ([\d,]+)$/))) return "Base " + m[1] + " + Weapon " + m[2] + " + Accessory " + m[3];
    if ((m = raw.match(/^기본 ([\d,]+) \+ 방어구 ([\d,]+) \+ 장신구 ([\d,]+)$/))) return "Base " + m[1] + " + Armor " + m[2] + " + Accessory " + m[3];
    if ((m = raw.match(/^포션 ([\d,]+) · 에테르 ([\d,]+) · 성수 ([\d,]+)$/))) return "Potion " + m[1] + " · Ether " + m[2] + " · Holy Water " + m[3];
    if ((m = raw.match(/^(.+) · 보유 ([\d,]+)개$/))) return named(m[1]) + " · Owned " + m[2];
    if ((m = raw.match(/^LV ([\d,]+) · (.+) · 누적 ([\d,]+)점(.*)$/))) return "LV " + m[1] + " · " + named(m[2]) + " · Total " + m[3] + " pts" + m[4];
    if ((m = raw.match(/^다음 레벨까지 ([\d,]+) EXP$/))) return m[1] + " EXP until next level";
    if ((m = raw.match(/^한계돌파 · 다음 레벨까지 ([\d,]+) EXP$/))) return "Limit Break · " + m[1] + " EXP to next level";
    if ((m = raw.match(/^🛏️ 묵는다 · 🪙 ([\d,]+)$/))) return "🛏️ Stay at the Inn · 🪙 " + m[1];

    return raw;
  }
  window.OSO_RPG_DYNAMIC = Object.freeze({ translate });
})();
