let id: (elementId: string) => HTMLElement = document.getElementById.bind(document);

if (!window.addEventListener) {
	id("compat-errors").innerHTML =
		"Your browser does not support features (addEventListener) required for SyncWeb. Please update to a newer browser.";
}

if (!WebSocket) {
	id("compat-errors").innerHTML =
		"Your browser does not support features (WebSocket) required for SyncWeb. Please update to a newer browser.";
}

import { SyncplayJSONClient } from "syncweb-js/src/index";
import Player from "./players/Player";
import WebTorrentShim from "./players/WebTorrentShim";

const syncWeb = new SyncplayJSONClient();

let currentPlayer: Player = null;

// This is very funky, probably should have implemented it differently but it looks nice
const playerFactories: ((url: string) => (() => Promise<Player>) | false)[] = [
	(url: string) => {
		if (url.split(":")[0] == "magnet") {
			return () =>
				Promise.all([WebTorrentShim(), import("./players/WebTorrentPlayer")]).then(
					([WebTorrent, WebTorrentPlayer]) => new WebTorrentPlayer.default(id("syncweb-player"), WebTorrent)
				);
		}
		return false;
	},
	(url: string) => {
		if (/^https?:\/\/(?:www\.)?youtu\.?be(?:\.com)?\/(?:watch\?v=)?([A-Za-z0-9_-]{11})/.test(url)) {
			return () =>
				import("./players/YoutubePlayer").then(
					YoutubePlayer => new YoutubePlayer.default(id("syncweb-player"))
				);
		}
		return false;
	},
	(url: string) => {
		if (url.split("://")[0] == "http" || url.split("://")[0] == "https") {
			return () =>
				import("./players/HTTPPlayer").then(HTTPPlayer => new HTTPPlayer.default(id("syncweb-player")));
		}
		return false;
	}
];
let currentPlayerFactoryIndex: number = -1;

id("connection-form").addEventListener(
	"submit",
	e => {
		e.preventDefault();
		id("connection-errors").innerHTML = "";

		let url = (<HTMLInputElement>id("url-input")).value;
		if (url != null && url.length > 3 && url.split("://").length == 2) {
			// TODO: error notification
			let name = (<HTMLInputElement>id("name-input")).value;
			let room = (<HTMLInputElement>id("room-input")).value;
			if (name != null && name.length > 0) {
				if (room != null && room.length > 0) {
					syncWeb.socketConnected.subscribe(() => {
						id("syncweb-connconfig").classList.add("hidden");
						//id("syncweb-player").innerText = "Connected to socket, loading...";
					});
					syncWeb.connect(name, room, url);
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
	},
	true
);

id("httpvideo-form").addEventListener(
	"submit",
	e => {
		e.preventDefault();
		id("connection-errors").innerHTML = "";

		let url = (<HTMLInputElement>id("httpvideo-input")).value;

		// TODO: handle errors
		let newPlayerFactory: (() => Promise<Player>) | false;
		let newPlayerFactoryIndex = playerFactories.findIndex(factory => {
			return (newPlayerFactory = factory(url)) !== false;
		});
		if (newPlayerFactoryIndex == -1 || newPlayerFactory == false) {
			// TODO: handle no supported players
			return false;
		}

		if (newPlayerFactoryIndex != currentPlayerFactoryIndex) {
			// TODO: revert if there are errors?
			currentPlayerFactoryIndex = newPlayerFactoryIndex;
			newPlayerFactory().then(player => {
				if (currentPlayer != null) {
					currentPlayer.destroy();
				}
				currentPlayer = player;
				setupPlayer();
				currentPlayer.setURL(url);
			});
		} else {
			currentPlayer.setURL(url);
		}
		return false;
	},
	true
);

let appendChat = (message: string, name?: string) => {
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
syncWeb.connected.subscribe((motd, version, features) => {
	if (motd != null) {
		//id("syncweb-player").innerText = motd;
		appendChat(motd);
	} else {
		//id("syncweb-player").innerText = "Connected";
	}
});

syncWeb.usersUpdated.subscribe(data => {
	appendChat(JSON.stringify(data), "room details");
});

syncWeb.chat.subscribe((user, message) => {
	appendChat(message, user.name);
});

syncWeb.joined.subscribe(user => {
	appendChat(`${user.name} joined room: "${user.room}"`);
});

syncWeb.left.subscribe(user => {
	appendChat(`${user.name} left room: "${user.room}"`);
});

syncWeb.moved.subscribe((user, room) => {
	appendChat(`${user.name} moved to room: "${user.room}" from: "${room}"`);
});

syncWeb.seek.subscribe((position, user) => {
	appendChat(`${user.name} seeked to ${position}`);
	currentPlayer.seekTo(position);
});

syncWeb.pause.subscribe(user => {
	appendChat(`${user.name} paused`);
	currentPlayer.pause();
});

syncWeb.unpause.subscribe(user => {
	// potential problem: unpause is sent from video.play()
	// could result in unintentional ready setting
	appendChat(`${user.name} unpaused`);
	currentPlayer.play();
});

function setupPlayer() {
	currentPlayer.setTime.subscribe(position => {
		syncWeb.setTime(position);
	});

	currentPlayer.seeked.subscribe(position => {
		if (syncWeb.getUsername()) {
			appendChat(`${syncWeb.getUsername()} seeked to ${position}`);
		} else {
			appendChat(`Seeked to ${position}`);
		}
		syncWeb.seekTo(position);
	});

	currentPlayer.unpaused.subscribe(() => {
		if (syncWeb.getUsername()) {
			appendChat(`${syncWeb.getUsername()} unpaused`);
		} else {
			appendChat(`Unpaused`);
		}
		syncWeb.setPause(false);
	});

	currentPlayer.paused.subscribe(() => {
		if (syncWeb.getUsername()) {
			appendChat(`${syncWeb.getUsername()} paused`);
		} else {
			appendChat(`Paused`);
		}
		syncWeb.setPause(true);
	});

	currentPlayer.setMeta.subscribe((name, duration) => {
		syncWeb.sendFile(name, duration);
	});
}
