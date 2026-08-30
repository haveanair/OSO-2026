#include "retro.h"

#define MMIO16(a) (*(volatile u16*)(a))
#define MMIO32(a) (*(volatile u32*)(a))
#define SND_CNT_H MMIO16(0x04000082)
#define SND_CNT_X MMIO16(0x04000084)
#define DMA1_SAD  MMIO32(0x040000BC)
#define DMA1_DAD  MMIO32(0x040000C0)
#define DMA1_CNT  MMIO32(0x040000C4)
#define TM0_D     MMIO16(0x04000100)
#define TM0_CNT   MMIO16(0x04000102)
#define TM1_D     MMIO16(0x04000104)
#define TM1_CNT   MMIO16(0x04000106)
#define FIFO_A_ADDR 0x040000A0u
#define DMA_AUDIO_FLAGS 0xB6400000u
#define TIMER0_22050_RELOAD 0xFD07u

static volatile int audio_playing = 0;

static void timer1_audio_irq(void) {
    TM0_CNT = 0;
    TM1_CNT = 0;
    DMA1_CNT = 0;
    audio_playing = 0;
}

void audio_init_22050(void) {
    SND_CNT_X = 0x0080;
    SND_CNT_H = 0x0B04;
    irqSet(IRQ_TIMER1, timer1_audio_irq);
    irqEnable(IRQ_TIMER1);
}

void audio_stop(void) {
    TM0_CNT = 0;
    TM1_CNT = 0;
    DMA1_CNT = 0;
    audio_playing = 0;
}

void audio_play_pcm22k(const s8 *data, u32 sample_count) {
    if (!data || sample_count < 4 || sample_count > 65535) return;
    audio_stop();
    SND_CNT_H = 0x0B04;
    DMA1_SAD = (u32)data;
    DMA1_DAD = FIFO_A_ADDR;
    DMA1_CNT = DMA_AUDIO_FLAGS;
    TM1_D = (u16)(0x10000u - sample_count);
    TM1_CNT = 0x00C4;
    TM0_D = TIMER0_22050_RELOAD;
    TM0_CNT = 0x0080;
    audio_playing = 1;
}

static const s8 click_pcm[512] __attribute__((aligned(4))) = {
#define C8 90,-90,72,-72,54,-54,36,-36
    C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,
    C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,
    C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,
    C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8,C8
#undef C8
};

void audio_tick_sfx(int kind) {
    (void)kind;
    if (!audio_playing) audio_play_pcm22k(click_pcm, sizeof(click_pcm));
}
