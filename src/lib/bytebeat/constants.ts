export const MODES = ['bytebeat', 'signed', 'floatbeat'] as const;
export type Mode = (typeof MODES)[number];
export const RATES = [8000, 11025, 16000, 22050, 32000, 44100, 48000] as const;
