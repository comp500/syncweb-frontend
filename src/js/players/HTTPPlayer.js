class HTMLPlayer extends SyncWeb.Player {
	constructor() {
		super("HTMLPlayer-builtin");
	}

	supports(url) {
		let split = url.split("://");
		return split[0] == "http";
	}

	command(command, data) {
		console.log(command, data); // eslint-disable-line no-console
	}
}

SyncWeb.Client.addStaticPlayer(new HTMLPlayer());