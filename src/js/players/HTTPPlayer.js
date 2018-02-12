class HTTPPlayer extends SyncWeb.Player {
	constructor(playerElement) {
		super("HTMLPlayer-builtin");
		this.playerElement = playerElement;
	}

	supports(url) {
		let split = url.split("://");
		return split[0] == "http";
	}

	seekTo(position) {
		if (this.videoElement) {
			this.justSeeked = true;
			this.videoElement.currentTime = position;
		} else {
			this.updatePosition = position;
		}
	}

	pause() {
		if (this.videoElement) {
			this.videoElement.pause();
		}
	}

	play() {
		if (this.videoElement) {
			this.videoElement.play();
		}
	}

	setURL(url) {
		if (!this.videoElement) {
			this.setupPlayer();
		}
		this.videoElement.src = url;
		let handler = () => {
			this.emit("setmeta", url, this.videoElement.duration);
			this.videoElement.removeEventListener("loadedmetadata", handler, false);
		};
		this.videoElement.addEventListener("loadedmetadata", handler, false);
	}

	setupPlayer() {
		this.videoElement = document.createElement("video");
		this.playerElement.innerHTML = "";
		this.playerElement.classList.remove("disconnected");
		this.videoElement.addEventListener("timeupdate", () => {
			this.emit("settime", this.videoElement.currentTime);
		}, false);
		this.videoElement.addEventListener("play", () => {
			this.emit("unpause");
		}, false);
		this.videoElement.addEventListener("pause", () => {
			this.emit("pause");
		}, false);
		this.videoElement.addEventListener("seeked", () => {
			if (this.justSeeked) {
				// ignore first seek
				this.justSeeked = false;
			} else {
				this.emit("seek", this.videoElement.currentTime);
			}
		}, false);
		this.videoElement.controls = true;
		this.videoElement.loop = false;
		if (this.updatePosition) {
			this.videoElement.currentTime = this.updatePosition;
			this.emit("settime", this.updatePosition);
			this.updatePosition = false;
			this.justSeeked = true;
		}
		this.playerElement.appendChild(this.videoElement);
	}
}

SyncWeb.HTTPPlayer = HTTPPlayer;