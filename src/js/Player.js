class Player extends SyncWeb.EventEmitter {
	constructor(name) {
		super();
		this.name = name;
	}
}

SyncWeb.Player = Player;