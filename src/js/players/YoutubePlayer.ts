import Player from "./Player";
import { EventTracker } from "syncweb-js/src/index";
import YTPlayer from "yt-player";

const seekWindow = 1.5;

export default class YoutubePlayer implements Player {
	private fileLoaded = false;
	private justSeeked = false;
	private justPaused = false;
	private justPlayed = false;
	private initialPosition = 0;
	private player: YTPlayer = null;

	private predictedPlaying = false;
	private prevClockTime = 0;
	private prevSeekTime = 0;

	readonly setMeta = new EventTracker<(url: string, duration: number) => void>();
	readonly setTime = new EventTracker<(time: number) => void>();
	readonly unpaused = new EventTracker<() => void>();
	readonly paused = new EventTracker<() => void>();
	readonly seeked = new EventTracker<(time: number) => void>();

	constructor(playerElement: HTMLElement) {
		playerElement.innerHTML = "";
		playerElement.classList.remove("disconnected");

		this.player = new YTPlayer(playerElement, {
			timeupdateFrequency: 300
		});

		this.player.on("timeupdate", time => {
			this.setTime.emit(time);

			// No "seeked" event exists, so we must emulate it with some tricks
			let predictedSeekTime = this.prevSeekTime;
			if (this.predictedPlaying) {
				predictedSeekTime += (new Date().getTime() / 1000) - this.prevClockTime;
			}

			if (Math.abs(predictedSeekTime - time) > seekWindow) {
				if (this.justSeeked) {
					// ignore first seek
					this.justSeeked = false;
				} else {
					this.seeked.emit(time);
				}
			}

			this.prevClockTime = (new Date().getTime() / 1000);
			this.prevSeekTime = time;
		});
		this.player.on("playing", () => {
			if (this.justPlayed) {
				this.justPlayed = false;
			} else {
				this.unpaused.emit();
			}
			this.predictedPlaying = true;
		});
		this.player.on("paused", () => {
			if (this.justPaused) {
				this.justPaused = false;
			} else {
				this.paused.emit();
			}
			this.predictedPlaying = false;
		});
		this.player.on("ended", () => {
			this.predictedPlaying = false;
		});

		if (this.initialPosition > 0) {
			this.player.seek(this.initialPosition);
			this.setTime.emit(this.player.getCurrentTime());
			this.initialPosition = 0;
			this.justSeeked = true;
		}
	}

	seekTo(position: number): void {
		if (this.fileLoaded) {
			this.justSeeked = true;
			this.player.seek(position);
		}
	}

	pause(): void {
		if (this.fileLoaded) {
			this.justPaused = true;
			this.player.pause();
		}
	}

	play(): void {
		if (this.fileLoaded) {
			this.justPlayed = true;
			this.player.play();
		}
	}

	setURL(url: string): void {
		this.player.load(/^https?:\/\/(?:www\.)?youtu\.?be(?:\.com)?\/(?:watch\?v=)?([A-Za-z0-9_-]{11})/.exec(url)[1]);
		let once = true;
		this.player.on("unstarted", () => {
			if (once) {
				once = false;
				this.fileLoaded = true;
				this.setMeta.emit(url, this.player.getDuration());
			}
		});
	}
}
