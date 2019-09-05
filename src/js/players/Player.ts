import { EventTracker } from "syncweb-js/src/index";

export default interface Player {
	readonly setMeta: EventTracker<(url: string, duration: number) => void>;
	readonly setTime: EventTracker<(time: number) => void>;
	readonly unpaused: EventTracker<() => void>;
	readonly paused: EventTracker<() => void>;
	readonly seeked: EventTracker<(time: number) => void>;

	readonly playerElement: HTMLElement;

	supports(url: string): boolean;
	seekTo(position: number): void;
	pause(): void;
	play(): void;
	setURL(url: string): void;
}