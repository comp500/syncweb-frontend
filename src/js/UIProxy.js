class UIProxy extends SyncWeb.PlayerProxy {
	constructor() {
		super("UIProxy-frontend");
	}
}

SyncWeb.addStaticPlayerProxy(new UIProxy());