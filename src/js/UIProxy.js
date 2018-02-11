class UIProxy extends SyncWeb.PlayerProxy {
	constructor() {
		super("UIProxy-frontend");
	}

	event(event, data) {
		console.log(event, data); // eslint-disable-line no-console
	}
}

SyncWeb.Client.addStaticPlayerProxy(new UIProxy());