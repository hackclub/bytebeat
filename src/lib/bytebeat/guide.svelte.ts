import { Engine } from './engine.svelte.ts';
import { player } from '../bytebeat.svelte.ts';

export class GuidePlayer {
	engine = new Engine();
	current = $state<string | null>(null);

	isPlaying(id: string) {
		return this.current === id && this.engine.playing;
	}

	async toggle(id: string, code: string) {
		if (this.isPlaying(id)) return this.engine.pause();
		if (!player.allowed()) return;
		if (this.current !== id) {
			this.engine.pause();
			this.engine.restart();
			this.current = id;
		}
		if (!this.engine.setCode(code, 'bytebeat', 8000)) return;
		await this.engine.play();
	}

	update(id: string, code: string) {
		if (this.current === id) this.engine.setCode(code, 'bytebeat', 8000);
	}

	destroy() {
		this.engine.destroy();
	}
}
