#ifndef OSO_RETRO_H
#define OSO_RETRO_H

#include <gba.h>

#define OSO_GAME_COUNT 7
#define OSO_RANK_COUNT 5
#define OSO_PCM_RATE 22050

typedef struct __attribute__((packed)) {
    u8 magic[4];
    u8 version;
    u8 unlocked_mask;
    u16 reserved;
    u32 total_score;
    u32 high_score[OSO_GAME_COUNT];
    u32 rank_score[OSO_RANK_COUNT];
    u32 checksum;
} OsoSave;

typedef enum {
    HAPTIC_LIGHT = 0,
    HAPTIC_MEDIUM,
    HAPTIC_HEAVY,
    HAPTIC_DOUBLE,
    HAPTIC_CRASH,
    HAPTIC_SUCCESS
} HapticEvent;

void save_load(OsoSave *out);
void save_commit(OsoSave *save);
void save_submit_score(OsoSave *save, int game_index, u32 score);
void save_apply_unlocks(OsoSave *save);

void haptic_init(void);
void haptic_stop(void);
void haptic_play(HapticEvent event);
void haptic_update(void);

void audio_init_22050(void);
void audio_stop(void);
void audio_play_pcm22k(const s8 *data, u32 sample_count);
void audio_tick_sfx(int kind);

u32 game_fish_run(int demo_mode, int *start_requested);

#endif
