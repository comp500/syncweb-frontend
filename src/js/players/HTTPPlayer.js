class HTMLPlayer extends SyncWeb.Player {
	constructor() {
		super("HTMLPlayer-builtin");
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
	}
}

SyncWeb.Client.addStaticPlayer(new HTMLPlayer());