class HTMLPlayer extends SyncWeb.Player {
	constructor() {
		super("HTMLPlayer-builtin");
	}

	initialise(client) {
		this.client = client;
	}

	supports(url) {
		let split = url.split("://");
		return split[0] == "http";
	}

	on(event, data) {
		console.log(event, data); // eslint-disable-line no-console
	}

	command(command, data) {
		console.log(command, data); // eslint-disable-line no-console
		if (command == "seturl") {
			if (!this.videoElement) {
				this.videoElement = document.createElement("video");
				this.client.playerElement.innerHTML = "";
				this.videoElement.addEventListener("timeupdate", () => {
					this.client.proxyCommandToProtocol("settime", this.videoElement.currentTime);
				}, false);
			}
			this.videoElement.src = data;
			this.client.proxyCommandToProtocol("setmeta", {
				duration: 60.139682,
				name: data
			});
		}
	}
}

SyncWeb.Client.addStaticPlayer(new HTMLPlayer());