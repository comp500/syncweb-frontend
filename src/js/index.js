let id = document.getElementById.bind(document);

if (!window.addEventListener) {
	id("compat-errors").innerHTML = "Your browser does not support features (addEventListener) required for SyncWeb. Please update to a newer browser.";
}

if (!window.WebSocket) {
	id("compat-errors").innerHTML = "Your browser does not support features (WebSocket) required for SyncWeb. Please update to a newer browser.";
}

const syncWeb = new SyncWeb.Client(id("syncweb-player"));
// remove when in production?
window.syncWeb = syncWeb;

id("connection-form").addEventListener("submit", (e) => {
	e.preventDefault();
	id("connection-errors").innerHTML = "";

	let url = id("url-input").value;
	if (url != null && url.length > 3 && url.split("://").length == 2) {
		// TODO: error notification
		let name = id("name-input").value;
		let room = id("room-input").value;
		if (name != null && name.length > 0) {
			if (room != null && room.length > 0) {
				syncWeb.connect("WebSocket-builtin", { url, name, room });
			} else {
				id("connection-errors").innerHTML = "Please type a room.";
			}
		} else {
			id("connection-errors").innerHTML = "Please type a username.";
		}
	} else {
		id("connection-errors").innerHTML = "Invalid URL.";
	}

	return false;
}, true);