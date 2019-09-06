import Player from "./Player";
import { EventTracker } from "syncweb-js/src/index";
//import WebTorrent from "webtorrent";

declare const WebTorrent: any;

export default class WebTorrentPlayer implements Player {
	private videoElement: HTMLVideoElement = null;
	private justSeeked = false;
	private justPaused = false;
	private justPlayed = false;
	private initialPosition = 0;
	private client: any = null;

	readonly setMeta = new EventTracker<(url: string, duration: number) => void>();
	readonly setTime = new EventTracker<(time: number) => void>();
	readonly unpaused = new EventTracker<() => void>();
	readonly paused = new EventTracker<() => void>();
	readonly seeked = new EventTracker<(time: number) => void>();

	constructor(public readonly playerElement: HTMLElement) {
		this.client = new WebTorrent();
		// TODO: test WebRTC support, show error if not available
	}

	supports(url: string): boolean {
		let split = url.split("://");
		return split[0] == "http" || split[0] == "https";
	}

	seekTo(position: number): void {
		if (this.videoElement != null) {
			this.justSeeked = true;
			this.videoElement.currentTime = position;
		} else {
			this.initialPosition = position;
		}
	}

	pause(): void {
		if (this.videoElement) {
			this.justPaused = true;
			this.videoElement.pause();
		}
	}

	play(): void {
		if (this.videoElement) {
			this.justPlayed = true;
			this.videoElement.play();
		}
	}

	setURL(url: string): void {
		console.log("Setting " + url);
		this.client.add(url, torrent => {
			console.log("Got " + torrent);
			// TODO: don't select the wrong file
			let file = torrent.files[0];

			this.playerElement.innerHTML = "";
			this.playerElement.classList.remove("disconnected");
			file.appendTo(this.playerElement, {
				maxBlobLength: 2 * 1000 * 1000 * 1000 // 2 GB
			}, (err, videoElement) => {
				if (err != null) {
					console.error(err);
				}
				this.videoElement = <HTMLVideoElement>videoElement;
				this.setupPlayer();
			});
		});
		// if (!this.videoElement) {
		// 	this.setupPlayer();
		// }
		// this.videoElement.src = url;
		// let handler = () => {
		// 	this.setMeta.emit(url, this.videoElement.duration);
		// 	this.videoElement.removeEventListener("loadedmetadata", handler, false);
		// };
		// this.videoElement.addEventListener("loadedmetadata", handler, false);
	}

	private setupPlayer(): void {
		// this.videoElement = document.createElement("video");
		// this.playerElement.innerHTML = "";
		// this.playerElement.classList.remove("disconnected");
		this.videoElement.addEventListener(
			"timeupdate",
			() => {
				this.setTime.emit(this.videoElement.currentTime);
			},
			false
		);
		this.videoElement.addEventListener(
			"play",
			() => {
				if (this.justPlayed) {
					this.justPlayed = false;
				} else {
					this.unpaused.emit();
				}
			},
			false
		);
		this.videoElement.addEventListener(
			"pause",
			() => {
				if (this.justPaused) {
					this.justPaused = false;
				} else {
					this.paused.emit();
				}
			},
			false
		);
		this.videoElement.addEventListener(
			"seeked",
			() => {
				if (this.justSeeked) {
					// ignore first seek
					this.justSeeked = false;
				} else {
					this.seeked.emit(this.videoElement.currentTime);
				}
			},
			false
		);
		this.videoElement.controls = true;
		this.videoElement.loop = false;
		if (this.initialPosition > 0) {
			this.videoElement.currentTime = this.initialPosition;
			this.setTime.emit(this.videoElement.currentTime);
			this.initialPosition = 0;
			this.justSeeked = true;
		}
		//this.playerElement.appendChild(this.videoElement);
	}
}
