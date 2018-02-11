class UIProxy extends SyncWeb.PlayerProxy {
	constructor() {
		super("UIProxy-frontend");
	}

	event(event, data) {
		let id = document.getElementById.bind(document);
		console.log("uiproxy", event, data); // eslint-disable-line no-console
		switch (event) {
			case "connecting":
				id("syncweb-connconfig").classList.add("hidden");
				id("syncweb-player").innerText = "Connecting with protocol " + data;
				break;
			case "connected":
				if (data) {
					id("syncweb-player").innerText = data;
				} else {
					id("syncweb-player").innerText = "Connected to socket, loading...";
				}
				break;
			case "roomdetails":

				break;
		}
	}
}

SyncWeb.Client.addStaticPlayerProxy(new UIProxy());