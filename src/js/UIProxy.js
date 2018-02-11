class UIProxy extends SyncWeb.PlayerProxy {
	constructor() {
		super("UIProxy-frontend");
		this.id = document.getElementById.bind(document);
	}

	event(event, data) {
		console.log("uiproxy", event, data); // eslint-disable-line no-console
		switch (event) {
			case "connecting":
				this.id("syncweb-connconfig").classList.add("hidden");
				this.id("syncweb-player").innerText = "Connecting with protocol " + data;
				break;
			case "connected":
				if (data) {
					this.id("syncweb-player").innerText = data;
					this.appendChat(data);
				} else {
					this.id("syncweb-player").innerText = "Connected to socket, loading...";
				}
				break;
			case "roomdetails":
				this.appendChat(JSON.stringify(data), "room details");
				break;
			case "chat":
				this.appendChat(data.message, data.name);
				break;
			case "joined":
				this.appendChat(`${data} joined`);
				break;
			case "left":
				this.appendChat(`${data} left`);
				break;
			case "moved":
				this.appendChat(`${data.user} moved to room: "${data.room}"`);
				break;
		}
	}

	appendChat(message, name) {
		let domMsg = document.createElement("div");
		if (name) {
			let domName = document.createElement("strong");
			domName.appendChild(document.createTextNode(`${name}: `));
			domMsg.appendChild(domName);
		}
		domMsg.appendChild(document.createTextNode(message));
		let chat = this.id("syncweb-chat");
		chat.appendChild(domMsg);
		chat.scrollTop = chat.scrollHeight;
	}
}

SyncWeb.Client.addStaticPlayerProxy(new UIProxy());