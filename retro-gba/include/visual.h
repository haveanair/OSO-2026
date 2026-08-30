#ifndef OSO_VISUAL_H
#define OSO_VISUAL_H
#include <gba.h>

typedef struct {
    int x;
    int y;
    int kind;
    int active;
} VisualDrop;

void visual_show_splash(void);
void visual_show_title(void);
void visual_show_ranking(void);
void visual_basket_begin(void);
void visual_basket_draw(int basket_x, const VisualDrop *drops, int count, int demo_mode);
void visual_fish_begin(void);
void visual_fish_draw(const u8 kinds[9], int cursor, int demo_mode);

#endif
