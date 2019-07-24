let id = document.getElementById.bind(document);

if (!window.addEventListener) {
	id("compat-errors").innerHTML = "Your browser does not support features (addEventListener) required for SyncWeb. Please update to a newer browser.";
}

if (!WebSocket) {
	id("compat-errors").innerHTML = "Your browser does not support features (WebSocket) required for SyncWeb. Please update to a newer browser.";
}

import { SyncplayJSONClient } from "syncweb-js";
import HTTPPlayer from "./players/HTTPPlayer";
const syncWeb = new SyncplayJSONClient();

// TODO make this detachable from player, and not created on startup, for changeable protocols
const currentPlayer = new HTTPPlayer(id("syncweb-player"));

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
				syncWeb.connect({url, name, room}, () => {
					id("syncweb-connconfig").classList.add("hidden");
					id("syncweb-player").innerText = "Connected to socket, loading...";
				});
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

	return false;
}, true);

let appendChat = (message, name?) => {
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
};

// TODO make these detachable from protocol, for changeable protocols
syncWeb.connected.subscribe((data) => {
	if (data) {
		id("syncweb-player").innerText = data;
		appendChat(data);
	} else {
		id("syncweb-player").innerText = "Connected";
	}
});

syncWeb.roomDetailsUpdated.subscribe((data) => {
	appendChat(JSON.stringify(data), "room details");
});

syncWeb.chat.subscribe((name, message) => {
	appendChat(message, name);
});

syncWeb.joined.subscribe((user, room) => {
	appendChat(`${user} joined room: "${room}"`);
});

syncWeb.left.subscribe((user, room) => {
	appendChat(`${user} left room: "${room}"`);
});

syncWeb.moved.subscribe((user, room) => {
	appendChat(`${user} moved to room: "${room}"`);
});

syncWeb.seek.subscribe((position, user) => {
	appendChat(`${user} seeked to ${position}`);
	currentPlayer.seekTo(position);
});

syncWeb.pause.subscribe((user) => {
	appendChat(`${user} paused`);
	currentPlayer.pause();
});

syncWeb.unpause.subscribe((user) => {
	// potential problem: unpause is sent from video.play()
	// could result in unintentional ready setting
	appendChat(`${user} unpaused`);
	currentPlayer.play();
});

currentPlayer.setTime.subscribe((position) => {
	syncWeb.setTime(position);
});

currentPlayer.seeked.subscribe((position) => {
	if (syncWeb.getCurrentUsername()) {
		appendChat(`${syncWeb.getCurrentUsername()} seeked to ${position}`);
	} else {
		appendChat(`Seeked to ${position}`);
	}
	syncWeb.seekTo(position);
});

currentPlayer.unpaused.subscribe(() => {
	if (syncWeb.getCurrentUsername()) {
		appendChat(`${syncWeb.getCurrentUsername()} unpaused`);
	} else {
		appendChat(`Unpaused`);
	}
	syncWeb.setPause(false);
});

currentPlayer.paused.subscribe(() => {
	if (syncWeb.getCurrentUsername()) {
		appendChat(`${syncWeb.getCurrentUsername()} paused`);
	} else {
		appendChat(`Paused`);
	}
	syncWeb.setPause(true);
});

currentPlayer.setMeta.subscribe((name, duration) => {
	syncWeb.sendFile(duration, name);
});