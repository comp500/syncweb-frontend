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

// TODO make this detachable from player, and not created on startup, for changeable protocols
const currentPlayer = new SyncWeb.HTTPPlayer(id("syncweb-player"));

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

id("httpvideo-form").addEventListener("submit", (e) => {
	e.preventDefault();
	id("connection-errors").innerHTML = "";

	let url = id("httpvideo-input").value;
	currentPlayer.setURL(url);
	syncWeb.setURL(url);

	return false;
}, true);

let appendChat = (message, name) => {
	let domMsg = document.createElement("div");
	if (name) {
		let domName = document.createElement("strong");
		domName.appendChild(document.createTextNode(`${name}: `));
		domMsg.appendChild(domName);
	}
	domMsg.appendChild(document.createTextNode(message));
	let chat = id("syncweb-chat");
	chat.appendChild(domMsg);
	chat.scrollTop = chat.scrollHeight;
}

// TODO make these detachable from protocol, for changeable protocols
syncWeb.on("connecting", () => {
	id("syncweb-connconfig").classList.add("hidden");
	id("syncweb-player").innerText = "Connecting";
});

syncWeb.on("connected", (data) => {
	if (data) {
		id("syncweb-player").innerText = data;
		appendChat(data);
	} else {
		id("syncweb-player").innerText = "Connected to socket, loading...";
	}
});

syncWeb.on("roomdetails", (data) => {
	appendChat(JSON.stringify(data), "room details");
});

syncWeb.on("chat", (name, message) => {
	appendChat(message, name);
});

syncWeb.on("joined", (user, room) => {
	appendChat(`${user} joined room: "${room}"`);
});

syncWeb.on("left", (user, room) => {
	appendChat(`${user} left room: "${room}"`);
});

syncWeb.on("moved", (user, room) => {
	appendChat(`${user} moved to room: "${room}"`);
});

syncWeb.on("seek", (position, user) => {
	appendChat(`${user} seeked to ${position}`);
	currentPlayer.seekTo(position);
});

syncWeb.on("pause", (user) => {
	appendChat(`${user} paused`);
	currentPlayer.pause();
});

syncWeb.on("unpause", (user) => {
	// potential problem: unpause is sent from video.play()
	// could result in unintentional ready setting
	appendChat(`${user} unpaused`);
	currentPlayer.play();
});

currentPlayer.on("settime", (position) => {
	syncWeb.setTime(position);
});

currentPlayer.on("seek", (position) => {
	syncWeb.seekTo(position);
});

currentPlayer.on("unpause", () => {
	syncWeb.setPause(false);
});

currentPlayer.on("pause", () => {
	syncWeb.setPause(true);
});

currentPlayer.on("setmeta", (name, duration) => {
	syncWeb.sendFile(duration, name);
});