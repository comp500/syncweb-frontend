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

	private metadataSet = false;
	private currURL = null;

	private predictedPlaying = false;
	private prevClockTime = 0;
	private prevSeekTime = 0;
	private timeUpdateInterval: NodeJS.Timeout = null;

	readonly setMeta = new EventTracker<(url: string, duration: number) => void>();
	readonly setTime = new EventTracker<(time: number) => void>();
	readonly unpaused = new EventTracker<() => void>();
	readonly paused = new EventTracker<() => void>();
	readonly seeked = new EventTracker<(time: number) => void>();

	// YTPlayer's timeupdate event doesn't run when the video is paused, so it's useless!
	private setTimeUpdateInterval(): void {
		if (this.timeUpdateInterval != null) return;
		this.timeUpdateInterval = setInterval(() => {
			if (this.player == null) return;
			let time = this.player.getCurrentTime();

			if (time == this.prevSeekTime) {
				return;
			}

			// TODO: during seek buffering, old time is sent, which causes other clients to revert???
			this.setTime.emit(time);

			// No "seeked" event exists, so we must emulate it with some tricks
			// Attempt to predict where the video time should be
			let predictedSeekTime = this.prevSeekTime;
			if (this.predictedPlaying) {
				predictedSeekTime += (new Date().getTime() / 1000 - this.prevClockTime) / this.player.getPlaybackRate();
			}

			// Compare the predicted and actual times, check if > seekWindow (adjusted for playback rate)
			if (Math.abs(predictedSeekTime - time) > seekWindow) {
				if (this.justSeeked) {
					// ignore first seek
					this.justSeeked = false;
				} else {
					this.seeked.emit(time);
				}
			}

			this.prevClockTime = new Date().getTime() / 1000;
			this.prevSeekTime = time;
		}, 300);
	}

	private unsetTimeUpdateInterval(): void {
		if (this.timeUpdateInterval != null) {
			clearInterval(this.timeUpdateInterval);
			this.timeUpdateInterval = null;
		}
	}

	constructor(playerElement: HTMLElement) {
		playerElement.innerHTML = "";
		playerElement.classList.remove("disconnected");

		// YTPlayer replaces the element you give it with the youtube iframe, for some reason
		let ytContainer = document.createElement("div");
		playerElement.appendChild(ytContainer);

		this.player = new YTPlayer(ytContainer, {
			timeupdateFrequency: 100000 // High so it doesn't execute that often
		});

		this.player.on("playing", () => {
			if (this.justPlayed) {
				this.justPlayed = false;
			} else {
				this.unpaused.emit();
			}
			this.predictedPlaying = true;
			this.setTimeUpdateInterval();
			if (!this.metadataSet) {
				this.setMeta.emit(this.currURL, this.player.getDuration());
			}
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

		// When cueing and buffering, reset the seek timer as it may take longer than seekWindow to load
		// TODO: does this affect seek then buffer??
		this.player.on("buffering", () => {
			this.prevClockTime = new Date().getTime() / 1000;
			//this.prevSeekTime = this.player.getCurrentTime();
		});
		this.player.on("cued", () => {
			this.prevClockTime = new Date().getTime() / 1000;
			//this.prevSeekTime = this.player.getCurrentTime();
			this.fileLoaded = true;
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
		this.metadataSet = false;
		this.currURL = url;
		this.player.load(/^https?:\/\/(?:www\.)?youtu\.?be(?:\.com)?\/(?:watch\?v=)?([A-Za-z0-9_-]{11})/.exec(url)[1]);
	}

	destroy(): void {
		this.unsetTimeUpdateInterval();
		this.player.destroy();
		this.player = null;
		this.fileLoaded = false;
	}
}
