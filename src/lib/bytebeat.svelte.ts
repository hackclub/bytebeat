export const RATE = 8000;
const SECONDS = 32;
const LENGTH = RATE * SECONDS;

export type Fn = (t: number) => number;

export function compile(formula: string): Fn {
	if (!formula.trim()) throw new Error('type a formula');
	const fn = new Function('t', `return (${formula});`) as Fn;
	fn(0);
	fn(12345);
	return fn;
}

const VOLUME_KEY = 'bytebeat:volume-ok';

class Player {
	source = $state<string | null>(null);
	playing = $state(false);
	volumeOk = $state(false);
	showVolumeNotice = $state(false);

	allowed(): boolean {
		if (this.volumeOk) return true;
		try {
			if (localStorage.getItem(VOLUME_KEY)) return (this.volumeOk = true);
		} catch {}
		this.showVolumeNotice = true;
		return false;
	}

	dismissVolumeNotice() {
		this.volumeOk = true;
		this.showVolumeNotice = false;
		try {
			localStorage.setItem(VOLUME_KEY, '1');
		} catch {}
	}

	#ctx: AudioContext | null = null;
	#node: AudioBufferSourceNode | null = null;
	#fn: Fn | null = null;
	#start = 0;
	#pausedAt = 0;

	play(source: string, fn: Fn, t0 = 0) {
		this.#stopNode();
		const ctx = (this.#ctx ??= new AudioContext());

		const buf = ctx.createBuffer(1, LENGTH, RATE);
		const data = buf.getChannelData(0);
		for (let t = 0; t < LENGTH; t++) data[t] = (fn(t) & 255) / 127.5 - 1;

		const node = ctx.createBufferSource();
		node.buffer = buf;
		node.loop = true;
		const gain = ctx.createGain();
		gain.gain.value = 0.2;
		node.connect(gain).connect(ctx.destination);

		const offset = (t0 % LENGTH) / RATE;
		node.start(0, offset);

		this.#node = node;
		this.#fn = fn;
		this.#start = ctx.currentTime - offset;
		this.source = source;
		this.playing = true;
	}

	pause() {
		if (!this.playing) return;
		this.#pausedAt = this.t ?? 0;
		this.#stopNode();
		this.playing = false;
	}

	stop() {
		this.#stopNode();
		this.#fn = null;
		this.#pausedAt = 0;
		this.source = null;
		this.playing = false;
	}

	toggle(source: string, formula: string) {
		if (this.playing && this.source === source) this.stop();
		else if (this.allowed()) this.play(source, compile(formula));
	}

	get t(): number | null {
		if (this.playing && this.#ctx) {
			return Math.floor((this.#ctx.currentTime - this.#start) * RATE) % LENGTH;
		}
		return this.source ? this.#pausedAt : null;
	}

	sample(t: number): number {
		return this.#fn ? this.#fn(t) & 255 : 128;
	}

	#stopNode() {
		this.#node?.stop();
		this.#node = null;
	}
}

export const player = new Player();
