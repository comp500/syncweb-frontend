// Small shim to load WebTorrent, because Parcel doesn't like bundling it for some reason

declare global {
	interface Window { WebTorrent: typeof import("webtorrent"); }
}

export default function(): Promise<typeof import("webtorrent")> {
	return new Promise<typeof import("webtorrent")>((resolve, reject) => {
		if (window.WebTorrent != null) {
			resolve(window.WebTorrent);
			return;
		}
		let script = document.createElement("script");
		script.onload = () => {
			resolve(window.WebTorrent);
		};
		script.onerror = (e) => {
			reject(e);
		};
		script.src = "https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js";
		document.head.appendChild(script);
	});
}