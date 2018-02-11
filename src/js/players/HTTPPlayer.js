class HTMLPlayer extends SyncWeb.Player {
	constructor() {
		super("HTMLPlayer-builtin");
	}

	supports(url) {
		let split = url.split("://");
		return split[0] == "http";
	}

	event(event, data) {
		console.log(event, data); // eslint-disable-line no-console
		if (event == "seek" && this.videoElement) {
			this.videoElement.currentTime = data;
		}
		if (event == "pause" && this.videoElement) {
			this.videoElement.pause();
		}
		if (event == "unpause" && this.videoElement) {
			this.videoElement.play();
		}
		if (event == "seturl") {
			if (!this.videoElement) {
				this.videoElement = document.createElement("video");
				this.client.playerElement.innerHTML = "";
				this.client.playerElement.classList.remove("disconnected");
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
					this.emit("seek", this.videoElement.currentTime);
				}, false);
				this.videoElement.controls = true;
				this.videoElement.loop = false;
				this.client.playerElement.appendChild(this.videoElement);
			}
			this.videoElement.src = data;
			let handler = () => {
				this.emit("setmeta", {
					duration: this.videoElement.duration,
					name: data
				});
				this.videoElement.removeEventListener("loadedmetadata", handler, false);
			};
			this.videoElement.addEventListener("loadedmetadata", handler, false);
		}
	}
}

SyncWeb.Client.addStaticPlayer(new HTMLPlayer());