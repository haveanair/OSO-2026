#include "retro.h"
#include <string.h>
#include <stddef.h>

#define SRAM8 ((volatile u8*)0x0E000000)
#define SAVE_VERSION 1

/* Temporary calibration table for the engine prototype only.
   Final thresholds will be fixed after all seven web-game score ranges are audited. */
static const u32 unlock_thresholds[OSO_GAME_COUNT] = {
    0, 800, 1800, 3200, 5000, 7200, 9800
};

static u32 checksum_bytes(const OsoSave *s) {
    const u8 *p = (const u8*)s;
    const u32 n = (u32)offsetof(OsoSave, checksum);
    u32 h = 0x4F534F32u;
    u32 i;
    for (i = 0; i < n; ++i) h = (h << 5) ^ (h >> 27) ^ p[i];
    return h;
}

static void defaults(OsoSave *s) {
    memset(s, 0, sizeof(*s));
    s->magic[0] = 'O'; s->magic[1] = 'S'; s->magic[2] = 'O'; s->magic[3] = '2';
    s->version = SAVE_VERSION;
    s->unlocked_mask = 0x01;
    s->checksum = checksum_bytes(s);
}

void save_load(OsoSave *out) {
    u8 *d = (u8*)out;
    u32 i;
    for (i = 0; i < sizeof(*out); ++i) d[i] = SRAM8[i];
    if (out->magic[0] != 'O' || out->magic[1] != 'S' ||
        out->magic[2] != 'O' || out->magic[3] != '2' ||
        out->version != SAVE_VERSION || out->checksum != checksum_bytes(out)) {
        defaults(out);
        save_commit(out);
    }
}

void save_commit(OsoSave *save) {
    const u8 *s;
    u32 i;
    save->checksum = checksum_bytes(save);
    s = (const u8*)save;
    for (i = 0; i < sizeof(*save); ++i) SRAM8[i] = s[i];
}

void save_apply_unlocks(OsoSave *save) {
    int i;
    for (i = 0; i < OSO_GAME_COUNT; ++i) {
        if (save->total_score >= unlock_thresholds[i]) save->unlocked_mask |= (1u << i);
    }
}

void save_submit_score(OsoSave *save, int game_index, u32 score) {
    int i, j;
    if (game_index < 0 || game_index >= OSO_GAME_COUNT) return;
    if (score > save->high_score[game_index]) save->high_score[game_index] = score;
    save->total_score += score;
    for (i = 0; i < OSO_RANK_COUNT; ++i) {
        if (score > save->rank_score[i]) {
            for (j = OSO_RANK_COUNT - 1; j > i; --j) save->rank_score[j] = save->rank_score[j - 1];
            save->rank_score[i] = score;
            break;
        }
    }
    save_apply_unlocks(save);
    save_commit(save);
}
