export type Track = 'individual' | 'club';

const KEY = 'bytebeat:track';

class TrackChoice {
	value = $state<Track | null>(null);

	load() {
		try {
			const v = localStorage.getItem(KEY);
			if (v === 'individual' || v === 'club') this.value = v;
		} catch {}
	}

	set(v: Track) {
		this.value = v;
		try {
			localStorage.setItem(KEY, v);
		} catch {}
	}
}

export const track = new TrackChoice();
