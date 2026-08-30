#include "visual.h"
#include "visual_assets.h"

#define RGB15(r,g,b) ((u16)((r)|((g)<<5)|((b)<<10)))
#define MODE4_PAGE0 ((volatile u16*)0x06000000)
#define MODE4_PAGE1 ((volatile u16*)0x0600A000)
#define MODE4_BYTES 38400u

static u8 bg_buffer[MODE4_BYTES] __attribute__((section(".ewram"), aligned(4)));

static void rle_unpack(const u8 *src, u8 *dst, u32 out_len) {
    u32 o = 0;
    while (o < out_len) {
        u8 cmd = *src++;
        u32 n = (u32)(cmd & 0x7F) + 1u;
        if (cmd & 0x80) {
            u8 v = *src++;
            while (n-- && o < out_len) dst[o++] = v;
        } else {
            while (n-- && o < out_len) dst[o++] = *src++;
        }
    }
}

static void load_static(const u16 *pal, const u8 *rle) {
    REG_DISPCNT = MODE_4 | BG2_ENABLE;
    dmaCopy(pal, BG_PALETTE, 512);
    rle_unpack(rle, bg_buffer, MODE4_BYTES);
    dmaCopy(bg_buffer, (void*)MODE4_PAGE0, MODE4_BYTES);
    dmaCopy(bg_buffer, (void*)MODE4_PAGE1, MODE4_BYTES);
}

static volatile u16 *hidden_page(void) {
    return (REG_DISPCNT & BACKBUFFER) ? MODE4_PAGE0 : MODE4_PAGE1;
}

static void putpix(volatile u16 *page, int x, int y, u8 c) {
    volatile u16 *p;
    u16 v;
    if ((unsigned)x >= 240u || (unsigned)y >= 160u) return;
    p = page + y * 120 + (x >> 1);
    v = *p;
    if (x & 1) v = (u16)((v & 0x00FFu) | ((u16)c << 8));
    else v = (u16)((v & 0xFF00u) | c);
    *p = v;
}

static void blit(volatile u16 *page, int x, int y, int w, int h, const u8 *src) {
    int xx, yy;
    for (yy = 0; yy < h; ++yy) {
        int dy = y + yy;
        if ((unsigned)dy >= 160u) continue;
        for (xx = 0; xx < w; ++xx) {
            int dx = x + xx;
            u8 c = src[yy * w + xx];
            if (!c || (unsigned)dx >= 240u) continue;
            putpix(page, dx, dy, c);
        }
    }
}

static u8 nearest(const u16 *pal, u16 target) {
    int i, best = 1;
    int tr = target & 31, tg = (target >> 5) & 31, tb = (target >> 10) & 31;
    unsigned bestd = 0xFFFFFFFFu;
    for (i = 1; i < 256; ++i) {
        int r = pal[i] & 31, g = (pal[i] >> 5) & 31, b = (pal[i] >> 10) & 31;
        int dr = r - tr, dg = g - tg, db = b - tb;
        unsigned d = (unsigned)(dr*dr + dg*dg + db*db);
        if (d < bestd) { bestd = d; best = i; }
    }
    return (u8)best;
}

static void outline(volatile u16 *page, int x, int y, int w, int h, u8 c) {
    int i;
    for (i = 0; i < w; ++i) { putpix(page, x+i, y, c); putpix(page, x+i, y+h-1, c); }
    for (i = 0; i < h; ++i) { putpix(page, x, y+i, c); putpix(page, x+w-1, y+i, c); }
}

static void copy_bg(const u16 *pal) {
    volatile u16 *page = hidden_page();
    dmaCopy(pal, BG_PALETTE, 512);
    dmaCopy(bg_buffer, (void*)page, MODE4_BYTES);
}

static void finish_frame(void) {
    VBlankIntrWait();
    REG_DISPCNT ^= BACKBUFFER;
}

void visual_show_splash(void) { load_static(splash_palette, splash_rle); }
void visual_show_title(void) { load_static(title_palette, title_rle); }
void visual_show_ranking(void) { load_static(ranking_palette, ranking_rle); }

void visual_basket_begin(void) {
    REG_DISPCNT = MODE_4 | BG2_ENABLE;
    dmaCopy(basket_palette, BG_PALETTE, 512);
    rle_unpack(basket_bg_rle, bg_buffer, MODE4_BYTES);
    dmaCopy(bg_buffer, (void*)MODE4_PAGE0, MODE4_BYTES);
    dmaCopy(bg_buffer, (void*)MODE4_PAGE1, MODE4_BYTES);
}

void visual_basket_draw(int basket_x, const VisualDrop *drops, int count, int demo_mode) {
    volatile u16 *page;
    int i;
    copy_bg(basket_palette);
    page = hidden_page();
    blit(page, basket_x + 4, 79, SPR_OSO_SPRITE_W, SPR_OSO_SPRITE_H, spr_oso_sprite);
    blit(page, basket_x, 122, SPR_BASKET_SPRITE_W, SPR_BASKET_SPRITE_H, spr_basket_sprite);
    for (i = 0; i < count; ++i) if (drops[i].active) {
        const u8 *spr = spr_apple;
        if (drops[i].kind == 2) spr = spr_bomb;
        else if (drops[i].kind == 1) spr = spr_gold;
        else if (((drops[i].x >> 3) % 3) == 1) spr = spr_orange;
        else if (((drops[i].x >> 3) % 3) == 2) spr = spr_carrot;
        blit(page, drops[i].x, drops[i].y, 24, 24, spr);
    }
    if (demo_mode) {
        u8 c = nearest(basket_palette, RGB15(31, 4, 7));
        outline(page, 1, 1, 238, 158, c);
    }
    finish_frame();
}

void visual_fish_begin(void) {
    REG_DISPCNT = MODE_4 | BG2_ENABLE;
    dmaCopy(fish_palette, BG_PALETTE, 512);
    rle_unpack(fish_bg_rle, bg_buffer, MODE4_BYTES);
    dmaCopy(bg_buffer, (void*)MODE4_PAGE0, MODE4_BYTES);
    dmaCopy(bg_buffer, (void*)MODE4_PAGE1, MODE4_BYTES);
}

void visual_fish_draw(const u8 kinds[9], int cursor, int demo_mode) {
    static const int cx[3] = {48, 120, 192};
    static const int cy[3] = {73, 105, 138};
    volatile u16 *page;
    int i;
    u8 white;
    copy_bg(fish_palette);
    page = hidden_page();
    for (i = 0; i < 9; ++i) if (kinds[i]) {
        int col = i % 3, row = i / 3;
        if (kinds[i] == 1) blit(page, cx[col]-12, cy[row]-12, SPR_FISH_W, SPR_FISH_H, spr_fish);
        else if (kinds[i] == 2) blit(page, cx[col]-12, cy[row]-12, SPR_FISHGOLD_W, SPR_FISHGOLD_H, spr_fishgold);
        else blit(page, cx[col]-17, cy[row]-18, SPR_FRIEND_OSO_W, SPR_FRIEND_OSO_H, spr_friend_oso);
    }
    white = nearest(fish_palette, RGB15(31,31,31));
    outline(page, cx[cursor%3]-27, cy[cursor/3]-18, 54, 36, white);
    if (demo_mode) {
        u8 c = nearest(fish_palette, RGB15(31,4,7));
        outline(page, 1, 1, 238, 158, c);
    }
    finish_frame();
}
