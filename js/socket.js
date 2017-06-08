function authResult(response) {
    if( response.result ) {
        money = parseInt(response.money);
        username = response.username;
        userid = parseInt(response.pk);
        document.cookie = response.token;
        chatrooms = response.chatrooms;
        adminLevel = response.adminLevel;
        console.log("Authenticated with Server.");


    } else {
        dialogMessage("Authentication Failed", "The Authentication process failed. Redirecting you to the homepage in 10 seconds.", "Ok");

        setTimeout(function() {
                window.location = "/";
        }, 2000);
    }
}

function Socket(host, type) {
	this.host = host;
	this.type = type;
	this.ws = null;
	this.Connected = false;
	var socket = this;
	
	console.log("Connecting to "+type+" Server.");
	
	try {
		this.ws = new WebSocket(host_admin); // create the web socket
	} catch (err) {
		dialogMessage("Network Failed", err.getMessage(), "Ok");
		
		setTimeout(function() {
			window.location = "/";
		}, 500);
	}
	
	this.ws.onopen = function () {
		socket.Connected = true;
		socket.Send({a:"auth","p":{"token":token}}, authResult);
		console.log("Connected to "+type+" Server.");
		//localStorage.removeItem("token");
	};
	
	this.ws.onclose = function () {
		socket.Connected = false;
		console.log("Disconnected from "+type+" Server.");
		
		dialogMessage("Server Connection Closed", "The game server abruptly disconnected the connection. Refresh the page to attempt to reconnect.", "Ok");
		setTimeout(function() {
			window.location = "/";
		}, 500);
	};
	
	this.isConnected = function() { 
		return this.Connected; 
	}
	
	this.queue = [];
	this.packetCount = 0;
	
	//packet management
	this.Send = function(packet, callback) {
		var packetId = this.packetCount++;
		packet.id = "P" + packetId;
		ws.send(JSON.stringify(packet));
		if( callback != null ) {
			queue[packet.id] = callback;
		}
	}
	
	this.ws.onmessage = function (evt) {
		if (typeof evt.data == "string") {
			var response = JSON.parse(evt.data);
			if( queue[response.id] ) {
				queue[response.id](response);
				delete queue[response.id];
			} else {
				//receive only or non tracked packet
				var action = response.a;
				var parameters = response.p;
				if( action == "l" ) {				//L for location
					
					money =  parameters.money;
					SetLocation(parameters);

				} else if( action == "u" ) {		//U for Update
					if( area != null ) {
						area.UpdatePacket(parameters);
					}
				} else if( action == "fainted" ) {		//U for Update
                                        dialogFainted();
				} else if( action == "npc" ) {		//Entity Changes to an Area
                                    if( script.length > 0 ) {
                                        scriptFinish();
                                        script = [];
                                    }
                                    script = response.p.lines;
                                    if( script.length > 0 ) {
                                        scriptStart();
                                    }
				} else if( action == "t" ) {		//Entity target changed
                                    if( area != null ) {
                                        var ent = entityById(area.entities,parameters.source.id);
                                        if( ent != null ) {
                                            ent.target.x = parameters.source.tx;
                                            ent.target.y = parameters.source.ty;
                                            
                                            if( parameters.source.d == 0 ) {
                                                this.direction = "down";
                                            } else if( parameters.source.d == 1 ) {
                                                this.direction = "left"
                                            } else if( parameters.source.d == 2 ) {
                                                this.direction = "right";
                                            } else {
                                                this.direction = "up";
                                            }

                                            if( Distance(ent.position.x,ent.position.y,parameters.source.x,parameters.source.y) > 5 ) {
                                                console.log("Entity Position Correciton: " + parameters.source.id);
                                                ent.position.x = parameters.source.x;
                                                ent.position.y = parameters.source.y;
                                                if( ent.type == 1 ) {
                                                    ent.at = parameters.source.at;
                                                    ent.atl = parameters.source.atl;
                                                }
                                            }
                                        }
                                    }
				} else if( action == "ent" ) {		//Entity Changes to an Area
					if( area != null ) {
						area.UpdateEntities(parameters);
					}	
				} else if( action == "static" ) { 		//Static Entity Updates
                                    if( area != null ) {
                                        area.StaticUpdatePacket(parameters);
                                    }
                                    
				} else if( action == "friend_remove" ) { 		//Static Entity Updates
                                    friendsRemoveServer(parameters);
                                    
				} else if( action == "f" ) { 		//Static Entity Updates
                                    friendsUpdate(parameters);
				} else if( action == "event" ) { 		//M for Messages
                                    if( area != null ) {
                                        area.EventRaise(parameters);
                                    }
				} else if( action == "m" ) { 		//M for Messages
					ChatroomsAppend(parameters);
					
				} else if( action == "e" ) { 		//M for Messages
					area.BattleEncounter(parameters);
					
				} else if( action == "url" ) { 		//M for Messages
					window.location = parameters.url;
				} else if( action == "team" ) { 		//M for Messages
					
					TeamUpdate(parameters);
				} else if( action == "items" ) { 		//M for Messages
					
					ItemsUpdate(parameters);
				} else if( action == "attack" ) { 		//M for Messages
					
					ProcessAttack(parameters);
				} else if( action == "emote" ) { 	//Emote for Messages
					if( area != null ) {
						area.EmoteAdd(parameters);
					}
				} else if( action == "evo" ) { 	//Emote for Messages
                                        
                                        EvolutionOption(parameters);
                                        
                                        
				}
			}
		}
	};
	
	return this;
}

var socketAdmin = null;
var socketEngine = null;

function SocketConnect() {
	//Engine is connected once we authenticate.
	if( getParameterByName("debug") == "true" ) {
		host_admin = "ws://localhost:8081/game";
	}
	socketAdmin = Socket(host_admin,"Admin");
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
