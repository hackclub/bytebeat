import workletUrl from './worklet.js?url&no-inline';
import { toFunctionBody } from './transform.ts';
import type { Mode } from './constants.ts';

export const SCOPE_SIZE = 8192;

export class Engine {
	playing = $state(false);
	t = $state(0);
	error = $state<string | null>(null);
	runtimeError = $state<string | null>(null);
	volume = $state(0.3);

	scope = new Float32Array(SCOPE_SIZE);
	scopeWrite = 0;
	scopeVersion = $state(0);

	#ctx: AudioContext | null = null;
	#node: AudioWorkletNode | null = null;
	#gain: GainNode | null = null;
	#starting: Promise<void> | null = null;
	#pending: { body: string; mode: Mode; rate: number } | null = null;

	async #start() {
		const ctx = new AudioContext();
		await ctx.audioWorklet.addModule(workletUrl);
		const node = new AudioWorkletNode(ctx, 'bytebeat', { outputChannelCount: [2] });
		const gain = ctx.createGain();
		gain.gain.value = this.volume;
		node.connect(gain).connect(ctx.destination);
		node.port.onmessage = (e) => this.#onMessage(e.data);
		this.#ctx = ctx;
		this.#node = node;
		this.#gain = gain;
		if (this.#pending) node.port.postMessage({ type: 'code', ...this.#pending });
	}

	#ensure() {
		this.#starting ??= this.#start();
		return this.#starting;
	}

	#onMessage(msg: { type: string; message?: string; t?: number; samples?: Float32Array }) {
		if (msg.type === 'ok') {
			this.error = null;
			this.runtimeError = null;
		} else if (msg.type === 'error') {
			this.error = msg.message ?? 'error';
		} else if (msg.type === 'runtime-error') {
			this.runtimeError = `${msg.message} (at t = ${msg.t})`;
		} else if (msg.type === 'tick') {
			this.t = msg.t ?? 0;
			const s = msg.samples;
			if (s && s.length) {
				for (let i = 0; i < s.length; i++) {
					this.scope[this.scopeWrite] = s[i];
					this.scopeWrite = (this.scopeWrite + 1) % SCOPE_SIZE;
				}
				this.scopeVersion++;
			}
		}
	}

	setCode(code: string, mode: Mode, rate: number): boolean {
		let body: string;
		try {
			body = toFunctionBody(code);
		} catch (err) {
			this.error = err instanceof Error ? err.message : String(err);
			return false;
		}
		this.#pending = { body, mode, rate };
		this.#node?.port.postMessage({ type: 'code', body, mode, rate });
		return true;
	}

	async play() {
		await this.#ensure();
		await this.#ctx!.resume();
		this.#node!.port.postMessage({ type: 'play' });
		this.playing = true;
	}

	pause() {
		this.#node?.port.postMessage({ type: 'pause' });
		this.playing = false;
	}

	restart() {
		this.scope.fill(0);
		this.scopeWrite = 0;
		this.scopeVersion++;
		this.#node?.port.postMessage({ type: 'seek', t: 0 });
		this.t = 0;
	}

	setVolume(v: number) {
		this.volume = v;
		if (this.#gain) this.#gain.gain.value = v;
	}

	destroy() {
		this.#node?.disconnect();
		this.#ctx?.close();
		this.#ctx = null;
		this.#node = null;
		this.#starting = null;
		this.playing = false;
	}
}
