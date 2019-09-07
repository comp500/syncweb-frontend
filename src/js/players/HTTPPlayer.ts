import Player from "./Player";
import { EventTracker } from "syncweb-js/src/index";

export default class HTTPPlayer implements Player {
	private videoElement: HTMLVideoElement = null;
	private justSeeked = false;
	private justPaused = false;
	private justPlayed = false;
	private initialPosition = 0;

	readonly setMeta = new EventTracker<(url: string, duration: number) => void>();
	readonly setTime = new EventTracker<(time: number) => void>();
	readonly unpaused = new EventTracker<() => void>();
	readonly paused = new EventTracker<() => void>();
	readonly seeked = new EventTracker<(time: number) => void>();

	constructor(playerElement: HTMLElement) {
		this.videoElement = document.createElement("video");
		playerElement.innerHTML = "";
		playerElement.classList.remove("disconnected");
		this.videoElement.addEventListener("timeupdate", () => {
			this.setTime.emit(this.videoElement.currentTime);
		}, false);
		this.videoElement.addEventListener("play", () => {
			if (this.justPlayed) {
				this.justPlayed = false;
			} else {
				this.unpaused.emit();
			}
		}, false);
		this.videoElement.addEventListener("pause", () => {
			if (this.justPaused) {
				this.justPaused = false;
			} else {
				this.paused.emit();
			}
		}, false);
		this.videoElement.addEventListener("seeked", () => {
			if (this.justSeeked) {
				// ignore first seek
				this.justSeeked = false;
			} else {
				this.seeked.emit(this.videoElement.currentTime);
			}
		}, false);
		this.videoElement.controls = true;
		this.videoElement.loop = false;
		if (this.initialPosition > 0) {
			this.videoElement.currentTime = this.initialPosition;
			this.setTime.emit(this.videoElement.currentTime);
			this.initialPosition = 0;
			this.justSeeked = true;
		}
		playerElement.appendChild(this.videoElement);
	}

	seekTo(position: number): void {
		this.justSeeked = true;
		this.videoElement.currentTime = position;
	}

	pause(): void {
		this.justPaused = true;
		this.videoElement.pause();
	}

	play(): void {
		this.justPlayed = true;
		this.videoElement.play();
	}

	setURL(url: string): void {
		this.videoElement.src = url;
		let handler = () => {
			this.setMeta.emit(url, this.videoElement.duration);
			this.videoElement.removeEventListener("loadedmetadata", handler, false);
		};
		this.videoElement.addEventListener("loadedmetadata", handler, false);
	}

	destroy() {
		this.videoElement.parentNode.removeChild(this.videoElement);
	}
}