#include "retro.h"
#include <stdio.h>

#define VRAM16 ((volatile u16*)0x06000000)
#define RGB15(r,g,b) ((u16)((r)|((g)<<5)|((b)<<10)))

typedef enum { T_NONE=0, T_FISH=1, T_GOLD=2, T_FRIEND=3 } TargetKind;
typedef struct { u8 kind; u8 life; } FishCell;

static u32 fish_rng = 0xF15A1884u;
static u32 frand32(void) {
    fish_rng = fish_rng * 1103515245u + 12345u;
    return fish_rng;
}

static void wait_frame_local(void) {
    VBlankIntrWait();
    haptic_update();
}

static void clear_screen(u16 c) {
    u32 i;
    for (i=0;i<240u*160u;++i) VRAM16[i]=c;
}

static void rect(int x,int y,int w,int h,u16 c) {
    int xx,yy;
    if(x<0){w+=x;x=0;} if(y<0){h+=y;y=0;}
    if(x+w>240)w=240-x; if(y+h>160)h=160-y;
    for(yy=0;yy<h;++yy) for(xx=0;xx<w;++xx) VRAM16[(y+yy)*240+x+xx]=c;
}

static void border(int x,int y,int w,int h,u16 c) {
    rect(x,y,w,2,c); rect(x,y+h-2,w,2,c); rect(x,y,2,h,c); rect(x+w-2,y,2,h,c);
}

static void pause_fish(void) {
    haptic_stop(); audio_stop();
    consoleDemoInit(); iprintf("\x1b[2J\x1b[7;12HPAUSED\x1b[11;8HSTART : RESUME");
    do { scanKeys(); wait_frame_local(); } while(keysHeld()&(KEY_START|KEY_A|KEY_B));
    while(1){ scanKeys(); if(keysDown()&KEY_START)break; wait_frame_local(); }
    do { scanKeys(); wait_frame_local(); } while(keysHeld()&KEY_START);
    REG_DISPCNT=MODE_3|BG2_ENABLE;
}

static int level_for_score(u32 score) {
    if(score>=680)return 5;
    if(score>=430)return 4;
    if(score>=240)return 3;
    if(score>=100)return 2;
    return 1;
}

static void spawn_wave(FishCell cell[9], int level) {
    int i,n,count=(level>=4)?2:1;
    for(i=0;i<9;++i){cell[i].kind=T_NONE;cell[i].life=0;}
    for(n=0;n<count;++n){
        int idx;
        do { idx=(int)(frand32()%9u); } while(cell[idx].kind!=T_NONE);
        {
            u32 roll=frand32()%100u;
            TargetKind kind;
            if(roll<12)kind=T_GOLD;
            else if(roll<(u32)(20+level))kind=T_FRIEND;
            else kind=T_FISH;
            cell[idx].kind=(u8)kind;
            cell[idx].life=(u8)(54-level*3);
        }
    }
}

static int best_demo_target(const FishCell cell[9]) {
    int i;
    for(i=0;i<9;++i) if(cell[i].kind==T_GOLD)return i;
    for(i=0;i<9;++i) if(cell[i].kind==T_FISH)return i;
    return -1;
}

static void render(FishCell cell[9], int cursor, int level, int seconds, u32 score, int combo, int demo) {
    int i;
    (void)score;
    clear_screen(RGB15(2,14,22));
    rect(0,0,240,15,RGB15(0,5,10));
    /* time, level and combo are represented as compact meter blocks in this engine checkpoint. */
    rect(5,4,seconds>35?70:seconds*2,6,RGB15(3,26,31));
    rect(88,4,level*10,6,RGB15(31,24,3));
    rect(150,4,(combo>15?15:combo)*5,6,RGB15(10,31,12));
    if(demo) rect(222,3,12,8,RGB15(31,3,20));
    for(i=0;i<9;++i){
        int col=i%3,row=i/3,x=24+col*70,y=22+row*43;
        rect(x,y,54,34,RGB15(3,20,28));
        border(x,y,54,34,(i==cursor)?RGB15(31,31,31):RGB15(5,25,31));
        if(cell[i].kind==T_FISH){
            rect(x+18,y+11,18,10,RGB15(4,26,31));
            rect(x+12,y+14,7,5,RGB15(4,26,31));
        } else if(cell[i].kind==T_GOLD){
            rect(x+17,y+10,20,12,RGB15(31,28,3));
            rect(x+11,y+14,7,5,RGB15(31,28,3));
        } else if(cell[i].kind==T_FRIEND){
            rect(x+18,y+7,18,20,RGB15(31,7,13));
            rect(x+13,y+11,7,12,RGB15(25,12,25));
        }
    }
    rect(0,151,240,9,RGB15(0,7,12));
}

u32 game_fish_run(int demo_mode, int *start_requested) {
    FishCell cell[9];
    int cursor=4,combo=0,level=1,frame=0,wave_clock=0;
    int seconds=35;
    u32 score=0;
    int i;
    if(start_requested)*start_requested=0;
    for(i=0;i<9;++i){cell[i].kind=T_NONE;cell[i].life=0;}
    REG_DISPCNT=MODE_3|BG2_ENABLE;
    spawn_wave(cell,level);

    while(frame<(demo_mode?900:2100)){
        int hit=0;
        u16 kd;
        scanKeys(); kd=keysDown();
        if(kd&KEY_START){
            if(demo_mode){if(start_requested)*start_requested=1;break;}
            pause_fish();
            continue;
        }

        if(demo_mode){
            int target=best_demo_target(cell);
            if(target>=0){
                int cc=cursor%3,cr=cursor/3,tc=target%3,tr=target/3;
                if(cc<tc)cursor++;
                else if(cc>tc)cursor--;
                else if(cr<tr)cursor+=3;
                else if(cr>tr)cursor-=3;
                else hit=1;
            }
        } else {
            if((kd&KEY_LEFT)&&(cursor%3)>0)cursor--;
            if((kd&KEY_RIGHT)&&(cursor%3)<2)cursor++;
            if((kd&KEY_UP)&&(cursor/3)>0)cursor-=3;
            if((kd&KEY_DOWN)&&(cursor/3)<2)cursor+=3;
            if(kd&KEY_A)hit=1;
        }

        if(hit && cell[cursor].kind!=T_NONE){
            TargetKind kind=(TargetKind)cell[cursor].kind;
            if(kind==T_FRIEND){
                combo=0; score=score>8?score-8:0;
                haptic_play(HAPTIC_CRASH); audio_tick_sfx(2);
            } else {
                u32 bonus;
                ++combo;
                bonus=(u32)(combo/4)*5u; if(bonus>30u)bonus=30u;
                score += (kind==T_GOLD)?40u:(10u+(u32)level*3u+bonus);
                haptic_play(kind==T_GOLD?HAPTIC_MEDIUM:HAPTIC_LIGHT); audio_tick_sfx(1);
            }
            cell[cursor].kind=T_NONE; cell[cursor].life=0;
            level=level_for_score(score);
        }

        {
            int active=0;
            for(i=0;i<9;++i) if(cell[i].kind!=T_NONE){
                active++;
                if(cell[i].life>0)--cell[i].life;
                if(cell[i].life==0){cell[i].kind=T_NONE;if(i==cursor){} }
            }
            if(active==0)wave_clock=999;
        }

        ++wave_clock;
        if(wave_clock >= (72-level*6)){
            spawn_wave(cell,level); wave_clock=0;
        }
        seconds=35-frame/60; if(seconds<0)seconds=0;
        render(cell,cursor,level,seconds,score,combo,demo_mode);
        wait_frame_local();
        ++frame;
    }
    haptic_stop(); audio_stop();
    return score;
}
