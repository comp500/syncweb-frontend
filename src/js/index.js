if (!window.addEventListener) {
	document.getElementById("compat-errors").innerHTML = "Your browser does not support features (addEventListener) required for SyncWeb. Please update to a newer browser.";
}

if (!window.WebSocket) {
	document.getElementById("compat-errors").innerHTML = "Your browser does not support features (WebSocket) required for SyncWeb. Please update to a newer browser.";
}

const syncWeb = new SyncWeb.Client();
// remove when in production?
window.syncWeb = syncWeb;

document.getElementById("connection-form").addEventListener("submit", (e) => {
	e.preventDefault();
	document.getElementById("connection-errors").innerHTML = "";

	let url = document.getElementById("url-input").value;
	if (url != null && url.length > 3 && url.split("://").length == 2) {
		// TODO: error notification
		syncWeb.connect("WebSocket-builtin", { url });
	} else {
		document.getElementById("connection-errors").innerHTML = "Invalid URL.";
	}

	return false;
}, true);