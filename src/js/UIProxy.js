class UIProxy extends SyncWeb.PlayerProxy {
	constructor() {
		super("UIProxy-frontend");
	}

	on(event, data) {
		console.log(event, data); // eslint-disable-line no-console
	}

	command(event, data) {
		console.log(event, data); // eslint-disable-line no-console
	}
}

SyncWeb.Client.addStaticPlayerProxy(new UIProxy());