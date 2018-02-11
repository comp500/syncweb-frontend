class UIProxy extends SyncWeb.PlayerProxy {
	constructor() {
		super("UIProxy-frontend");
	}

	event(event, data) {
		console.log("uiproxy", event, data); // eslint-disable-line no-console
		switch (event) {
			case "roomdetails":
				
				break;
		}
	}
}

SyncWeb.Client.addStaticPlayerProxy(new UIProxy());