if (!window.addEventListener) {
	document.getElementById("compat-errors").innerHTML = "Your browser does not support features (addEventListener) required for SyncWeb. Please update to a newer browser.";
}

if (!window.WebSocket) {
	document.getElementById("compat-errors").innerHTML = "Your browser does not support features (WebSocket) required for SyncWeb. Please update to a newer browser.";
}

const syncWeb = new SyncWeb.Client();
// remove when in production?
window.syncWeb = syncWeb;

document.getElementById("connection-form").addEventListener(() => {
	// TODO: error notification
	console.log(document.getElementById("url-input").value); // eslint-disable-line no-console
	return false;
}, true);