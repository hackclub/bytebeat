// @ts-nocheck
for (const key of Object.getOwnPropertyNames(Math)) globalThis[key] = Math[key];

const POST_EVERY = 1024;
const MAX_PENDING = 8192;

class BytebeatProcessor extends AudioWorkletProcessor {
	constructor() {
		super();
		this.fn = null;
		this.mode = 'bytebeat';
		this.rate = 8000;
		this.t = 0;
		this.lastT = -1;
		this.value = 0;
		this.playing = false;
		this.pending = [];
		this.frames = 0;
		this.lastErrorAt = -Infinity;
		this.port.onmessage = (e) => this.onMessage(e.data);
	}

	onMessage(msg) {
		if (msg.type === 'code') {
			try {
				const fn = new Function('t', msg.body);
				fn(0);
				this.fn = fn;
				this.mode = msg.mode;
				this.rate = msg.rate;
				this.lastT = -1;
				this.port.postMessage({ type: 'ok' });
			} catch (err) {
				this.port.postMessage({ type: 'error', message: String(err?.message ?? err) });
			}
		} else if (msg.type === 'play') {
			this.playing = true;
		} else if (msg.type === 'pause') {
			this.playing = false;
		} else if (msg.type === 'seek') {
			this.t = msg.t;
			this.lastT = -1;
			this.port.postMessage({ type: 'tick', t: Math.floor(this.t), samples: new Float32Array(0) });
		}
	}

	evaluate(t) {
		let v;
		try {
			v = this.fn(t);
		} catch (err) {
			if (currentTime - this.lastErrorAt > 1) {
				this.lastErrorAt = currentTime;
				this.port.postMessage({ type: 'runtime-error', message: String(err?.message ?? err), t });
			}
			return 0;
		}
		if (this.mode === 'floatbeat') {
			v = +v;
			if (!Number.isFinite(v)) return 0;
			return v > 1 ? 1 : v < -1 ? -1 : v;
		}
		if (this.mode === 'signed') return (((v + 128) & 255) - 128) / 128;
		return ((v & 255) - 128) / 128;
	}

	process(_inputs, outputs) {
		const output = outputs[0];
		const left = output[0];

		if (!this.playing || !this.fn) {
			for (const ch of output) ch.fill(0);
			return true;
		}

		const step = this.rate / sampleRate;
		for (let i = 0; i < left.length; i++) {
			const ti = Math.floor(this.t);
			if (ti !== this.lastT) {
				this.value = this.evaluate(ti);
				this.lastT = ti;
				if (this.pending.length < MAX_PENDING) this.pending.push(this.value);
			}
			left[i] = this.value;
			this.t += step;
		}
		for (let c = 1; c < output.length; c++) output[c].set(left);

		this.frames += left.length;
		if (this.frames >= POST_EVERY) {
			this.frames = 0;
			const samples = Float32Array.from(this.pending);
			this.pending.length = 0;
			this.port.postMessage({ type: 'tick', t: Math.floor(this.t), samples }, [samples.buffer]);
		}
		return true;
	}
}

registerProcessor('bytebeat', BytebeatProcessor);
