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
				this.appendChat(JSON.stringify(data));
				break;
		}
	}

	appendChat(message, name) {
		let domMsg = document.createElement("div");
		if (name) {
			let domName = document.createElement("strong");
			domName.appendChild(document.createTextNode(`${name}: `));
			domMsg.appendChild(domMsg);
		}
		domMsg.appendChild(document.createTextNode(message));
		this.id("syncweb-chat").appendChild(domMsg);
	}
}

SyncWeb.Client.addStaticPlayerProxy(new UIProxy());