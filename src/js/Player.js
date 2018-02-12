class Player extends SyncWeb.util.EventEmitter {
	constructor(name) {
		super();
		this.name = name;
	}
}

SyncWeb.Player = Player;