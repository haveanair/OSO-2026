#include "retro.h"

#define GPIO_DATA (*(volatile u16*)0x080000C4)
#define GPIO_DIR  (*(volatile u16*)0x080000C6)

static const u8 pattern_light[]   = {2,0};
static const u8 pattern_medium[]  = {5,0};
static const u8 pattern_heavy[]   = {9,0};
static const u8 pattern_double[]  = {2,3,2,0};
static const u8 pattern_crash[]   = {8,3,5,2,3,0};
static const u8 pattern_success[] = {2,2,2,2,8,0};

static const u8 *pat = 0;
static u8 pat_index = 0;
static u8 frames_left = 0;
static u8 motor_on = 0;

static void motor_set(int on) {
    motor_on = on ? 1 : 0;
    GPIO_DATA = motor_on ? (1u << 3) : 0;
}

void haptic_init(void) {
    GPIO_DIR = (1u << 3);
    motor_set(0);
}

void haptic_stop(void) {
    pat = 0;
    pat_index = 0;
    frames_left = 0;
    motor_set(0);
}

void haptic_play(HapticEvent event) {
    switch (event) {
        case HAPTIC_LIGHT: pat = pattern_light; break;
        case HAPTIC_MEDIUM: pat = pattern_medium; break;
        case HAPTIC_HEAVY: pat = pattern_heavy; break;
        case HAPTIC_DOUBLE: pat = pattern_double; break;
        case HAPTIC_CRASH: pat = pattern_crash; break;
        default: pat = pattern_success; break;
    }
    pat_index = 0;
    motor_set(1);
    frames_left = pat[pat_index++];
}

void haptic_update(void) {
    if (!pat) return;
    if (frames_left) --frames_left;
    if (frames_left) return;
    if (pat[pat_index] == 0) {
        haptic_stop();
        return;
    }
    motor_set(!motor_on);
    frames_left = pat[pat_index++];
}
