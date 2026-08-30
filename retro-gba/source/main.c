#include "retro.h"
#include "visual.h"
#include <string.h>

typedef enum { ATTR_SPLASH, ATTR_TITLE, ATTR_RANK, ATTR_DEMO } AttractState;

static OsoSave g_save;
static u32 rng_state = 0x18842026u;

static u32 rnd32(void) {
    rng_state = rng_state * 1664525u + 1013904223u;
    return rng_state;
}

static void idle_frame(void) {
    VBlankIntrWait();
    haptic_update();
}

static int wait_or_start(int frames) {
    int i;
    for (i = 0; i < frames; ++i) {
        scanKeys();
        if (keysDown() & KEY_START) return 1;
        idle_frame();
    }
    return 0;
}

static int overlaps(int ax,int ay,int aw,int ah,int bx,int by,int bw,int bh) {
    return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

static u32 basket_run(int demo_mode, int *start_requested) {
    VisualDrop drops[8];
    int basket_x = 84;
    int frame, spawn_clock = 0, lives = 5, combo = 0;
    u32 score = 0;
    int i;
    if (start_requested) *start_requested = 0;
    memset(drops, 0, sizeof(drops));
    visual_basket_begin();

    for (frame = 0; frame < (demo_mode ? 720 : 1800) && lives > 0; ++frame) {
        u16 kd, kh;
        scanKeys(); kd = keysDown(); kh = keysHeld();
        if (kd & KEY_START) {
            if (demo_mode && start_requested) *start_requested = 1;
            break;
        }

        if (demo_mode) {
            int target = -1, besty = -1;
            for (i = 0; i < 8; ++i) if (drops[i].active && drops[i].kind != 2 && drops[i].y > besty) {
                target = i; besty = drops[i].y;
            }
            if (target >= 0) {
                int want = drops[target].x - 24;
                if (basket_x < want) basket_x += 2;
                else if (basket_x > want) basket_x -= 2;
            } else {
                int phase = (frame / 100) & 1;
                basket_x += phase ? 1 : -1;
            }
        } else {
            if (kh & KEY_LEFT) basket_x -= 3;
            if (kh & KEY_RIGHT) basket_x += 3;
        }
        if (basket_x < 0) basket_x = 0;
        if (basket_x > 168) basket_x = 168;

        if (++spawn_clock >= 34) {
            spawn_clock = 0;
            for (i = 0; i < 8; ++i) if (!drops[i].active) {
                u32 r = rnd32();
                drops[i].active = 1;
                drops[i].x = 5 + (int)(r % 211u);
                drops[i].y = 26;
                drops[i].kind = ((r >> 8) % 12u == 0) ? 2 : (((r >> 12) % 8u == 0) ? 1 : 0);
                break;
            }
        }

        for (i = 0; i < 8; ++i) if (drops[i].active) {
            drops[i].y += 2;
            if (overlaps(drops[i].x,drops[i].y,24,24,basket_x+4,119,64,31)) {
                if (drops[i].kind == 2) {
                    --lives; combo = 0;
                    score = score > 35 ? score - 35 : 0;
                    haptic_play(HAPTIC_CRASH); audio_tick_sfx(2);
                } else {
                    ++combo;
                    score += drops[i].kind == 1 ? 70u : 10u + (u32)(combo > 12 ? 12 : combo);
                    haptic_play(drops[i].kind == 1 ? HAPTIC_MEDIUM : HAPTIC_LIGHT);
                    audio_tick_sfx(1);
                }
                drops[i].active = 0;
            } else if (drops[i].y > 157) {
                if (drops[i].kind == 0) combo = 0;
                drops[i].active = 0;
            }
        }

        visual_basket_draw(basket_x, drops, 8, demo_mode);
        haptic_update();
    }

    haptic_stop(); audio_stop();
    if (!demo_mode) save_submit_score(&g_save, 0, score);
    return score;
}

typedef struct { u8 kind; u8 life; } DemoFish;

static int best_fish(const DemoFish c[9]) {
    int i;
    for (i=0;i<9;++i) if(c[i].kind==2) return i;
    for (i=0;i<9;++i) if(c[i].kind==1) return i;
    return -1;
}

static void fish_spawn(DemoFish c[9], int wave) {
    int i, count = wave > 5 ? 2 : 1;
    for (i=0;i<9;++i) { c[i].kind=0; c[i].life=0; }
    for (i=0;i<count;++i) {
        int idx;
        do { idx=(int)(rnd32()%9u); } while(c[idx].kind);
        {
            u32 r=rnd32()%100u;
            c[idx].kind = r<12 ? 2 : (r<23 ? 3 : 1);
            c[idx].life = 55;
        }
    }
}

static int fish_demo(int *start_requested) {
    DemoFish c[9];
    u8 kinds[9];
    int cursor=4,frame,wave=0,clock=0,i;
    if(start_requested)*start_requested=0;
    memset(c,0,sizeof(c)); fish_spawn(c,wave);
    visual_fish_begin();
    for(frame=0;frame<720;++frame) {
        int t;
        scanKeys();
        if(keysDown()&KEY_START){if(start_requested)*start_requested=1;break;}
        t=best_fish(c);
        if(t>=0){
            int cc=cursor%3,cr=cursor/3,tc=t%3,tr=t/3;
            if(cc<tc)cursor++; else if(cc>tc)cursor--; else if(cr<tr)cursor+=3; else if(cr>tr)cursor-=3; else { c[cursor].kind=0; haptic_play(HAPTIC_LIGHT); }
        }
        for(i=0;i<9;++i){ if(c[i].kind && c[i].life) --c[i].life; if(c[i].kind && !c[i].life)c[i].kind=0; kinds[i]=c[i].kind; }
        if(++clock>70){fish_spawn(c,++wave);clock=0;for(i=0;i<9;++i)kinds[i]=c[i].kind;}
        visual_fish_draw(kinds,cursor,1);
        haptic_update();
    }
    haptic_stop(); return start_requested?*start_requested:0;
}

static void play_first_game(void) {
    (void)basket_run(0, 0);
    visual_show_title();
    wait_or_start(60);
}

int main(void) {
    AttractState state = ATTR_SPLASH;
    int demo_index = 0;
    irqInit(); irqEnable(IRQ_VBLANK);
    haptic_init(); audio_init_22050(); save_load(&g_save);

    while (1) {
        int start = 0;
        switch (state) {
            case ATTR_SPLASH:
                visual_show_splash(); start = wait_or_start(90); state = ATTR_TITLE; break;
            case ATTR_TITLE:
                visual_show_title(); start = wait_or_start(150); state = ATTR_RANK; break;
            case ATTR_RANK:
                visual_show_ranking(); start = wait_or_start(120); state = ATTR_DEMO; break;
            case ATTR_DEMO:
                if (demo_index == 0) (void)basket_run(1, &start);
                else (void)fish_demo(&start);
                demo_index = (demo_index + 1) & 1;
                state = ATTR_SPLASH;
                break;
        }
        if (start) play_first_game();
    }
}
