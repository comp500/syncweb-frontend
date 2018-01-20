let id = document.getElementById.bind(document);

if (!window.addEventListener) {
	id("compat-errors").innerHTML = "Your browser does not support features (addEventListener) required for SyncWeb. Please update to a newer browser.";
}

if (!window.WebSocket) {
	id("compat-errors").innerHTML = "Your browser does not support features (WebSocket) required for SyncWeb. Please update to a newer browser.";
}

const syncWeb = new SyncWeb.Client();
// remove when in production?
window.syncWeb = syncWeb;

id("connection-form").addEventListener("submit", (e) => {
	e.preventDefault();
	id("connection-errors").innerHTML = "";

	let url = id("url-input").value;
	if (url != null && url.length > 3 && url.split("://").length == 2) {
		// TODO: error notification
		syncWeb.connect("WebSocket-builtin", { url });
	} else {
		id("connection-errors").innerHTML = "Invalid URL.";
	}

	return false;
}, true);