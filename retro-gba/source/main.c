#include "retro.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define VRAM16 ((volatile u16*)0x06000000)
#define RGB15(r,g,b) ((u16)((r)|((g)<<5)|((b)<<10)))

typedef enum { ATTR_SPLASH, ATTR_TITLE, ATTR_RANK, ATTR_DEMO } AttractState;

static OsoSave g_save;
static u32 rng_state = 0x18842026u;

static u32 rnd(void) {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}

static void wait_frame(void) {
    VBlankIntrWait();
    haptic_update();
}

static void shell_console(void) {
    consoleDemoInit();
    iprintf("\x1b[2J");
}

static void center_line(int row, const char *s) {
    int col = (30 - (int)strlen(s)) / 2;
    if (col < 0) col = 0;
    iprintf("\x1b[%d;%dH%s", row, col, s);
}

static int wait_or_start(int frames) {
    int i;
    for (i = 0; i < frames; ++i) {
        scanKeys();
        if (keysDown() & KEY_START) return 1;
        wait_frame();
    }
    return 0;
}

static void wait_keys_released(void) {
    do {
        scanKeys();
        wait_frame();
    } while (keysHeld() & (KEY_START | KEY_A | KEY_B));
}

static void pause_game(void) {
    haptic_stop();
    audio_stop();
    shell_console();
    center_line(7, "PAUSED");
    center_line(11, "START : RESUME");
    wait_keys_released();
    while (1) {
        scanKeys();
        if (keysDown() & KEY_START) break;
        wait_frame();
    }
    wait_keys_released();
    REG_DISPCNT = MODE_3 | BG2_ENABLE;
}

static void show_splash(void) {
    shell_console();
    center_line(5, "POWER DUCKZIL 2026");
    center_line(8, "1884 JINJU CENTRAL MARKET");
    center_line(13, "RETRO GBA EDITION");
    center_line(18, "START : PLAY");
}

static void show_title(void) {
    char buf[32];
    shell_console();
    center_line(4, "WELCOME, OSO!");
    center_line(7, "CENTRAL MARKET GAME ROOM");
    center_line(10, "RETRO");
    snprintf(buf, sizeof(buf), "TOTAL SCORE %lu", (unsigned long)g_save.total_score);
    center_line(14, buf);
    center_line(18, "PRESS START");
}

static void show_ranking(void) {
    int i;
    shell_console();
    center_line(2, "LOCAL RANKING");
    for (i = 0; i < OSO_RANK_COUNT; ++i) {
        iprintf("\x1b[%d;7H%d. %08lu", 6 + i * 2, i + 1, (unsigned long)g_save.rank_score[i]);
    }
    center_line(18, "START : PLAY");
}

static void mode3_clear(u16 color) {
    u32 i;
    for (i = 0; i < 240u * 160u; ++i) VRAM16[i] = color;
}

static void rect(int x, int y, int w, int h, u16 c) {
    int xx, yy;
    if (x < 0) { w += x; x = 0; }
    if (y < 0) { h += y; y = 0; }
    if (x + w > 240) w = 240 - x;
    if (y + h > 160) h = 160 - y;
    for (yy = 0; yy < h; ++yy)
        for (xx = 0; xx < w; ++xx)
            VRAM16[(y + yy) * 240 + x + xx] = c;
}

static int overlap(int ax,int ay,int aw,int ah,int bx,int by,int bw,int bh) {
    return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

typedef struct { int x,y,kind,active; } Drop;

static u32 run_basket(int demo_mode, int *start_requested) {
    Drop drops[8];
    int basket_x = 100, frame, spawn_clock = 0, lives = 5, combo = 0;
    u32 score = 0;
    int i;
    if (start_requested) *start_requested = 0;
    memset(drops, 0, sizeof(drops));
    REG_DISPCNT = MODE_3 | BG2_ENABLE;
    mode3_clear(RGB15(9,18,10));

    for (frame = 0; frame < (demo_mode ? 900 : 1800) && lives > 0; ++frame) {
        u16 kd, kh;
        scanKeys(); kd = keysDown(); kh = keysHeld();
        if (kd & KEY_START) {
            if (demo_mode) {
                if (start_requested) *start_requested = 1;
                break;
            }
            pause_game();
            continue;
        }

        if (demo_mode) {
            int phase = (frame / 90) & 3;
            if (phase == 0 || phase == 3) basket_x -= 2;
            else basket_x += 2;
        } else {
            if (kh & KEY_LEFT) basket_x -= 3;
            if (kh & KEY_RIGHT) basket_x += 3;
        }
        if (basket_x < 4) basket_x = 4;
        if (basket_x > 196) basket_x = 196;

        if (++spawn_clock >= 36) {
            spawn_clock = 0;
            for (i = 0; i < 8; ++i) if (!drops[i].active) {
                drops[i].active = 1;
                drops[i].x = 8 + (int)(rnd() % 220u);
                drops[i].y = 18;
                drops[i].kind = ((rnd() % 11u) == 0) ? 2 : (((rnd() % 7u) == 0) ? 1 : 0);
                break;
            }
        }

        mode3_clear(RGB15(9,18,10));
        rect(0,0,240,12,RGB15(2,2,4));
        rect(basket_x,136,40,10,RGB15(28,19,4));
        rect(basket_x+4,132,32,5,RGB15(31,25,8));

        for (i = 0; i < 8; ++i) if (drops[i].active) {
            u16 color;
            drops[i].y += 2;
            color = drops[i].kind == 2 ? RGB15(31,3,3) : (drops[i].kind == 1 ? RGB15(31,31,4) : RGB15(3,31,8));
            rect(drops[i].x, drops[i].y, 8, 8, color);
            if (overlap(drops[i].x,drops[i].y,8,8,basket_x,130,40,18)) {
                if (drops[i].kind == 2) {
                    if (lives) --lives;
                    combo = 0;
                    score = score > 35 ? score - 35 : 0;
                    haptic_play(HAPTIC_CRASH);
                    audio_tick_sfx(2);
                } else {
                    u32 pts;
                    ++combo;
                    pts = drops[i].kind == 1 ? 70u : (10u + (u32)((combo / 5) * 5));
                    if (pts > 40u && drops[i].kind == 0) pts = 40u;
                    score += pts;
                    haptic_play(drops[i].kind == 1 ? HAPTIC_MEDIUM : HAPTIC_LIGHT);
                    audio_tick_sfx(1);
                }
                drops[i].active = 0;
            } else if (drops[i].y > 155) {
                if (drops[i].kind == 0) combo = 0;
                drops[i].active = 0;
            }
        }
        wait_frame();
    }
    haptic_stop();
    audio_stop();
    return score;
}

static int demo_placeholder(int index) {
    char buf[32];
    shell_console();
    snprintf(buf, sizeof(buf), "DEMO %d", index + 1);
    center_line(5, buf);
    center_line(9, "PORTING SLOT READY");
    center_line(13, "REAL ENGINE REPLAY");
    return wait_or_start(240);
}

static int run_demo(int index) {
    int start = 0;
    if (index == 0) {
        (void)run_basket(1, &start);
        return start;
    }
    if (index == 1) {
        (void)game_fish_run(1, &start);
        return start;
    }
    return demo_placeholder(index);
}

static void show_unlock_event(int index) {
    char buf[32];
    shell_console();
    center_line(5, "NEW GAME UNLOCKED!");
    snprintf(buf, sizeof(buf), "GAME %d", index + 1);
    center_line(9, buf);
    haptic_play(HAPTIC_SUCCESS);
    audio_tick_sfx(3);
    wait_or_start(120);
}

static void play_game_slot(int index) {
    u8 old_mask = g_save.unlocked_mask;
    u32 score;
    if (index == 0) {
        score = run_basket(0, 0);
        save_submit_score(&g_save, 0, score);
    } else if (index == 1) {
        score = game_fish_run(0, 0);
        save_submit_score(&g_save, 1, score);
    } else {
        shell_console();
        center_line(7, "THIS GAME IS BEING PORTED");
        center_line(12, "B : BACK");
        while (1) { scanKeys(); if (keysDown() & (KEY_B|KEY_START)) break; wait_frame(); }
        return;
    }
    if (g_save.unlocked_mask != old_mask) {
        int i;
        for (i = 1; i < OSO_GAME_COUNT; ++i)
            if ((g_save.unlocked_mask & (1u << i)) && !(old_mask & (1u << i))) show_unlock_event(i);
    }
}

static void game_select(void) {
    int sel = 0;
    while (1) {
        int i;
        shell_console();
        center_line(1, "GAME SELECT");
        for (i = 0; i < OSO_GAME_COUNT; ++i) {
            int unlocked = (g_save.unlocked_mask >> i) & 1;
            iprintf("\x1b[%d;3H%c GAME %d  %s  HI:%05lu", 4 + i * 2,
                    i == sel ? '>' : ' ', i + 1, unlocked ? "OPEN" : "LOCK",
                    (unsigned long)g_save.high_score[i]);
        }
        center_line(19, "A:START  B:TITLE");
        scanKeys();
        if (keysDown() & KEY_UP) { sel = (sel + OSO_GAME_COUNT - 1) % OSO_GAME_COUNT; haptic_play(HAPTIC_LIGHT); }
        if (keysDown() & KEY_DOWN) { sel = (sel + 1) % OSO_GAME_COUNT; haptic_play(HAPTIC_LIGHT); }
        if (keysDown() & KEY_B) return;
        if (keysDown() & KEY_A) {
            if (g_save.unlocked_mask & (1u << sel)) play_game_slot(sel);
            else { haptic_play(HAPTIC_DOUBLE); audio_tick_sfx(0); }
        }
        wait_frame();
    }
}

int main(void) {
    AttractState state = ATTR_SPLASH;
    int demo_index = 0;
    irqInit();
    irqEnable(IRQ_VBLANK);
    haptic_init();
    audio_init_22050();
    save_load(&g_save);

    while (1) {
        int start = 0;
        switch (state) {
            case ATTR_SPLASH:
                show_splash(); start = wait_or_start(120); state = ATTR_TITLE; break;
            case ATTR_TITLE:
                show_title(); start = wait_or_start(180); state = ATTR_RANK; break;
            case ATTR_RANK:
                show_ranking(); start = wait_or_start(180); state = ATTR_DEMO; break;
            case ATTR_DEMO:
                start = run_demo(demo_index);
                demo_index = (demo_index + 1) % OSO_GAME_COUNT;
                state = ATTR_SPLASH;
                break;
        }
        if (start) game_select();
    }
}
