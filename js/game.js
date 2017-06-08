var debug = true;
var interval = 25;

var status = [
        "None",
        "Paralyzed",
        "Poisoned",
        "Badly Poisoned",
        "Burned",
        "Frozen",
        "Flinch",
        "Confused",
        "Infatuation",
        "Leech Seed",
        "Sleeping"
    ];

var friends = [];
var friendRequests = [];

var root = "/play/";
var flowerTiles = [1218,1281,1344,1407,1470,1533,1596];
var monsterAnimated = [12,16,17,18,21,22,41,42,44,83,142,145,146,166,169,176,193,226,227,249,250,267,276,277,278,279,284,291,333,334,384,397,398,414,415,416,425,426,458,468,469,519,520,521,527,528,561,566,567,580,581,628,629,630,642,645,661,662,663,666,701,717,731,732,733,741];


var timer = null;
var ctx = null;
var canvasWidth = 0;
var canvasHeight = 0;
var scale = 1;
var sourceSize = 64;
var backgroundColor = "#000";
var skillTypes = null;

var mobileMode = false;
var SystemFont = null;

var GameClock = 0.0;
var GameHour =  0.0;
var GameMinute =  0.0;
var RealMinutesPerGameHour = 15.0;

var notificationIdentifier = 0;
var notifications = [];
var interfaces = [];
var money = 0;

var chatIsShowing = true;
var chatSize = 200;

var interfaceEncounter = null;
var interfaceGame = null;
var interfaceEmoji = null;
var inputTimer = 0;

var username = null;
var userid = null;
var adminLevel = null;
var money = null;
var items = null;
var selectedItem = null;


var delayRetargeting = false;
var keystate = new Object;
keystate.up = false;
keystate.down = false;
keystate.left = false;
keystate.right = false;
keystate.space = false;

var iconBackpack = null;
var iconPokedex = null;
var iconMap = null;
var iconMusic = null;
var iconPokemon = [];

var pokemonTeam = [];
var pokemonStorage = [];

var types = {
	"1":{"damage_class_id":2,"name":"Normal","id":1,"pk":1},
	"2":{"damage_class_id":2,"name":"Fighting","id":2,"pk":2},
	"3":{"damage_class_id":2,"name":"Flying","id":3,"pk":3},
	"4":{"damage_class_id":2,"name":"Poison","id":4,"pk":4},
	"5":{"damage_class_id":2,"name":"Ground","id":5,"pk":5},
	"6":{"damage_class_id":2,"name":"Rock","id":6,"pk":6},
	"7":{"damage_class_id":2,"name":"Bug","id":7,"pk":7},
	"8":{"damage_class_id":2,"name":"Ghost","id":8,"pk":8},
	"9":{"damage_class_id":2,"name":"Steel","id":9,"pk":9},
	"10":{"damage_class_id":3,"name":"Fire","id":10,"pk":10},
	"11":{"damage_class_id":3,"name":"Water","id":11,"pk":11},
	"12":{"damage_class_id":3,"name":"Grass","id":12,"pk":12},
	"13":{"damage_class_id":3,"name":"Electric","id":13,"pk":13},
	"14":{"damage_class_id":3,"name":"Psychic","id":14,"pk":14},
	"15":{"damage_class_id":3,"name":"Ice","id":15,"pk":15},
	"16":{"damage_class_id":3,"name":"Dragon","id":16,"pk":16},
	"17":{"damage_class_id":3,"name":"Dark","id":17,"pk":17},
	"18":{"damage_class_id":0,"name":"Fairy","id":18,"pk":18},
	"10001":{"damage_class_id":0,"name":"Unknown","id":10001,"pk":10001},
	"10002":{"damage_class_id":0,"name":"Shadow","id":10002,"pk":10002}
};

var script = [];
var pokeballs = null;

function ResourcesHaveLoaded(callback) {
	if( definitionResourceLoadedCount < definitionResources.length ) {
		setTimeout(function() {
			ResourcesHaveLoaded(callback)
		}, 200);
	} else {
		callback();
	}
}

$( document ).ready(function() {



	//Window and Browser Config
	$(window).resize(function(){
		WindowResize();
	});

	setTimeout(function() {
		WindowResize();
		DerriveScale();
	}, 150);

	//Canvas Config
	CanvasSetup();

	//Load Sprite and Tilesets
	ResourcesSetup();
        pokeballs = new ResourceImage("/play/images/pokeballs.png","/play/images/pokeballs.png",true);
        skillTypes = new ResourceImage("/play/images/skillTypes.png","/play/images/skillTypes.png",true);
	  
	//Conntect to the Server
	ResourcesHaveLoaded(SocketConnect);


	if( $(window).width() < 1024 ) {
            mobileMode = true;
            
	} else {
            if( $(window).width() > 1900 ) {
                //SetScale(2);
            } else {
                //SetScale(1.5);
            }
        }

	interval = 25;
	if( mobileMode )
		interval = 50;

	if( document.cookie == null || document.cookie == "" ) {

		dialogMessage("Authentication Failed", "The Authentication process failed. Redirecting you to the homepage in 10 seconds.", "Ok");

		setTimeout(function() {
			window.location = "/";
		}, 10000);

		return;
	}

	//Game Timer
	var timer = setInterval(function() {
		update();
		draw();
	}, interval);
        
        setTimeout(dialogGettingStarted, 2000);
});

var area = null;
var character = null;
var topLeft = {"x":0,"y":0};

function SetLocation(parameters) {		//standard char packet
	//check if the new map is the same map in which case we do not need to reload.
	var isSameMap = false;
	if( area != null ) {
		if( area.code == parameters.area ) {
			isSameMap = true;
		}
	}

	if( !isSameMap ) {
		area = new Area(parameters.area);
		var direction = "left";
		if( character != null ) {
			direction = character.direction;
		}
		character = new Entity(parameters);
		character.direction = direction;

		area.entities.push(character);

	} else {

	}
}



var delayMouseMoveEvent = false;
function GameMouseMove(evt) {
	if( delayMouseMoveEvent )
		return;

	if( !delayRetargeting ) {
		var x = evt.pageX - $('#game').offset().left;
		var y = evt.pageY - $('#game').offset().top;

		if ( (navigator.userAgent.indexOf('Firefox') > -1 && evt.buttons > 0) ||  (navigator.userAgent.indexOf('Firefox') == -1 && evt.which == 1)  ) {
			delayRetargeting = true;
			window.setTimeout(function() {delayRetargeting = false;}, 500);

			if( evt.target == document.getElementById("game") ) {
				GameClickEvent(x,y,true);
			}

		}
	}
	return true;
}

function GameClick(evt) {
	delayMouseMoveEvent = true;

	var x = evt.pageX - $('#game').offset().left;
	var y = evt.pageY - $('#game').offset().top;

	GameClickEvent(x,y,false);

	setTimeout(function() { delayMouseMoveEvent = false; }, 100);
}

function GameClickEvent(x,y,passive) {
    var taken = scriptClick();
    if( !taken ) {
        //top to bottom
        for(var i=interfaces.length-1;i>=0;i--) {
            var iface = interfaces[i];
            if( iface.Click(x,y,passive) ) {	//if the event is claimed
                return true;
            }
        }

        //check for area events
        if( area != null ) {
            if( !area.loading ) {
                area.Click(x,y,passive);
            }
        }
    }
}


function UpdateTime() {
	var now = new Date();
	var seconds = now.getSeconds();
	var minutes = now.getMinutes();

	var baseHour = (minutes/RealMinutesPerGameHour - parseInt(minutes/RealMinutesPerGameHour))*RealMinutesPerGameHour;
	GameClock = 6+((baseHour + (seconds/60))/RealMinutesPerGameHour*19);

	GameHour = parseInt(GameClock);
	GameMinute = parseInt((GameClock - parseInt(GameClock))*60);

	if( (GameHour + "") .length == 1 ) {
		GameHour = "0" + GameHour;
	} else {
		GameHour += "";
	}

	if( (GameMinute + "") .length == 1 ) {
		GameMinute = "0" + GameMinute;
	} else {
		GameMinute += "";
	}

}

function update() {
    if( area == null )
            return;
    if( area.loading )
            return;

    UpdateTime();
    area.Update();

    //check for key input
    inputTimer++;
    if( inputTimer > 9 ) {
            inputTimer = 0;
            if( keystate.up )
                    character.SetTarget({"x":character.position.x,"y":character.position.y-1});
            if( keystate.down )
                    character.SetTarget({"x":character.position.x,"y":character.position.y+1});
            if( keystate.left )
                    character.SetTarget({"x":character.position.x-1,"y":character.position.y});
            if( keystate.right )
                    character.SetTarget({"x":character.position.x+1,"y":character.position.y});
    }

    scriptUpdate();
    
    //update notifications
    var index = 0;
    for(var i=notifications.length-1;i>=0;i--) {
        var res = notifications[i].Update(index);
        if( !res ) {
            notifications.splice(i,1);
        } else {
            index++;
        }
    }
    
}

function draw() {
	ctx.fillStyle=backgroundColor;
	ctx.fillRect(0,0,canvasWidth,canvasHeight);

	if( area == null )
		return;
	if( area.loading )
		return;

	CenterMap();
	area.Draw();

	for(var i=0;i<interfaces.length;i++){
            interfaces[i].Draw();
	}

	userMoney.text = "$ " + money.toLocaleString();
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function entityById(entities, entId) {
	for(var i=0;i<entities.length;i++) {
		var entity = entities[i];
		if( entity.id == entId ) {
			return entity;
		}
	}
	return null;
}

function EvolutionOption(parameters) {
    var comp = [];
    var monFrom = parameters.from+"";
    monFrom = "000"+monFrom;
    monFrom = monFrom.substring(monFrom.length-3,monFrom.length);
    
    var monTo = parameters.to+"";
    monTo = "000"+monTo;
    monTo = monTo.substring(monTo.length-3,monTo.length);
    
    var text1 = "Evolve ";
    var text1Width = SystemFont.Draw(text1,0,0,"left",1,false);
    var text2 = " into ";
    var text2Width = SystemFont.Draw(text2,0,0,"left",1,false);

    comp.push({"text": text1,"image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40,"offsetY":10},"type":"bg", "scale":1});
    comp.push({"text": null,"image":root + "images/icons/" + monFrom + ".png","definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":32,"h":32,"data":{"offsetX":40+text1Width+5,"offsetY":-2},"type":"bg", "scale":1});
    comp.push({"text": text2,"image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40+text1Width+32+10,"offsetY":10},"type":"bg", "scale":1});
    comp.push({"text": null,"image":root + "images/icons/" + monTo + ".png","definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":32,"h":32,"data":{"offsetX":40+text1Width+32+text2Width+12,"offsetY":-2},"type":"bg", "scale":1});
    comp.push({"text": null,"image":root + "images/tick.png","definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"from":parameters.from,"to":parameters.to,"pk":parameters.pk,"offsetX":40+text1Width+32+text2Width+32+15,"offsetY":10},"onclick":EvolutionConfirm,"type":"bg", "scale":1});
    
    //10 seconds
    new Notification({"life":25000,"components":comp});
}

function EvolutionConfirm(element) {
    var pk = element.data.pk;
    var from = element.data.from;
    var to = element.data.to;
    
    var packet = {"a":"evo","p":{"pk":pk,"from":from,"to":to}};
    socketAdmin.Send(packet, function(response) {
        console.log("Success");
    });
    
    for(var i=0;i<notifications.length;i++) {
        notifications[i].Expire();
    }
}

function Area( code ) {
	this.loading = true;
	this.code = code;

	var path = this.code.split(":");
	this.base = path[0];
	this.url = map_admin  + this.base + ".xml?v="+versionCode;

	this.base = [];
	this.decoration = [];
	this.decoration_under = [];
	this.decoration_over = [];
	this.collision = [];
	this.above = [];
	this.warps = [];

	this.entities = [];
	this.staticEntities = [];
	this.animationEntities = [];

	this.frame = 0;
	this.waterFrame = 0;
	this.frameTimer = 0;

        this.EventRaise = function(parameters) {
            if( parameters.type == "level" ) {
                if( parameters.originator ) {
                    var comp = [];
                    
                    var mon = parameters.monster+"";
                    mon = "000"+mon;
                    mon = mon.substring(mon.length-3,mon.length);
                    
                    var text = parameters.username + "'s";
                    var textWidth = SystemFont.Draw(text,0,0,"left",1,false);
                    
                    comp.push({"text": text,"image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40,"offsetY":10},"type":"bg", "scale":1});
                    comp.push({"text": null,"image":root + "images/icons/" + mon + ".png","definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":32,"h":32,"data":{"offsetX":40+textWidth+5,"offsetY":-2},"type":"bg", "scale":1});
                    comp.push({"text": "Leveled up to Lv." + parameters.level,"image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40+textWidth+32+10,"offsetY":10},"type":"bg", "scale":1});
                    
                    var id = parameters.originator.substring(1,parameters.originator.length);
                    var mon = TeamMemberByPk(id);
                    if( mon != null ) {
                        mon.SetLevel(parameters.level);
                    }
                    
                    //10 seconds
                    new Notification({"life":10000,"components":comp});
                }
                
            } else if( parameters.type == "flinched" ) {
                if( parameters.originator ) {
                    var comp = [];
                    
                    var mon = parameters.monster+"";
                    mon = "000"+mon;
                    mon = mon.substring(mon.length-3,mon.length);
                    
                    var text = parameters.username + "'s";
                    if( parameters.username.toLowerCase() == "wild" ) {
                        text = parameters.username;
                    }
                    var textWidth = SystemFont.Draw(text,0,0,"left",1,false);
                    
                    comp.push({"text": text,"image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40,"offsetY":10},"type":"bg", "scale":1});
                    comp.push({"text": null,"image":root + "images/icons/" + mon + ".png","definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":32,"h":32,"data":{"offsetX":40 + textWidth + 5,"offsetY":-2},"type":"bg", "scale":1});
                    comp.push({"text": "Flinched","image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40 + textWidth + 32+ 10,"offsetY":10},"type":"bg", "scale":1});
                    
                    //10 seconds
                    new Notification({"life":3000,"components":comp});
                }
            } else if( parameters.type == "faint" ) {
                if( parameters.originator ) {
                    var comp = [];
                    
                    var mon = parameters.monster+"";
                    mon = "000"+mon;
                    mon = mon.substring(mon.length-3,mon.length);
                    
                    var text = parameters.username + "'s";
                    if( parameters.username.toLowerCase() == "wild" ) {
                        text = parameters.username;
                    }
                    var textWidth = SystemFont.Draw(text,0,0,"left",1,false);
                    
                    comp.push({"text": text,"image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40,"offsetY":10},"type":"bg", "scale":1});
                    comp.push({"text": null,"image":root + "images/icons/" + mon + ".png","definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":32,"h":32,"data":{"offsetX":40 + textWidth + 5,"offsetY":-2},"type":"bg", "scale":1});
                    comp.push({"text": "Fainted","image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40 + textWidth + 32+ 10,"offsetY":10},"type":"bg", "scale":1});
                    
                    //10 seconds
                    new Notification({"life":10000,"components":comp});
                }
                
            } else if( parameters.type == "missed" ) {
                if( parameters.originator ) {
                    var comp = [];
                    
                    var mon = parameters.monster+"";
                    mon = "000"+mon;
                    mon = mon.substring(mon.length-3,mon.length);
                    
                    var text = parameters.username + "'s";
                    if( parameters.username.toLowerCase() == "wild" ) {
                        text = parameters.username;
                    }
                    var textWidth = SystemFont.Draw(text,0,0,"left",1,false);
                    
                    comp.push({"text": parameters.username + "","image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40,"offsetY":13},"type":"bg", "scale":0.75});
                    comp.push({"text": null,"image":root + "images/icons/" + mon + ".png","definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":32,"h":32,"data":{"offsetX":40+textWidth+5,"offsetY":-2},"type":"bg", "scale":1});
                    comp.push({"text": "used " + parameters.skill + " and missed","image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40+textWidth+32+10,"offsetY":13},"type":"bg", "scale":0.75});
                    
                    //10 seconds
                    new Notification({"life":3000,"components":comp});
                }
                
            } else if( parameters.type == "caught" ) {
                if( parameters.originator ) {
                    var comp = [];
                    
                    var mon = parameters.monster+"";
                    mon = "000"+mon;
                    mon = mon.substring(mon.length-3,mon.length);
                    
                    var text = parameters.username + " caught";
                    var textWidth = SystemFont.Draw(text,0,0,"left",1,false);
                    
                    
                    comp.push({"text": text,"image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40,"offsetY":10},"type":"bg", "scale":1});
                    comp.push({"text": null,"image":root + "images/icons/" + mon + ".png","definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":32,"h":32,"data":{"offsetX":40+textWidth+5,"offsetY":-2},"type":"bg", "scale":1});
                    comp.push({"text": "Lv." + parameters.level,"image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40+textWidth+32+10,"offsetY":10},"type":"bg", "scale":1});
                    
                    //10 seconds
                    new Notification({"life":10000,"components":comp});
                }
            } else if( parameters.type == "evolved" ) {
                if( parameters.originator ) {
                    var comp = [];
                    
                    var mon = parameters.from+"";
                    mon = "000"+mon;
                    mon = mon.substring(mon.length-3,mon.length);
                    
                    var monTo = parameters.to+"";
                    monTo = "000"+monTo;
                    monTo = monTo.substring(monTo.length-3,monTo.length);
                    
                    var text1 = parameters.username + " ";
                    var text1Width = SystemFont.Draw(text1,0,0,"left",1,false);
                    
                    var text2 = " evolved into ";
                    var text2Width = SystemFont.Draw(text2,0,0,"left",1,false);
                    
                    comp.push({"text": text1,"image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40,"offsetY":10},"type":"bg", "scale":1});
                    comp.push({"text": null,"image":root + "images/icons/" + mon + ".png","definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":32,"h":32,"data":{"offsetX":40+text1Width+5,"offsetY":-2},"type":"bg", "scale":1});
                    comp.push({"text": text2,"image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40+text1Width+32+10,"offsetY":10},"type":"bg", "scale":1});
                    comp.push({"text": null,"image":root + "images/icons/" + monTo + ".png","definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":32,"h":32,"data":{"offsetX":40+text1Width+32+15+text2Width,"offsetY":-2},"type":"bg", "scale":1});
                    
                    //10 seconds
                    new Notification({"life":10000,"components":comp});
                }
            } else if( parameters.type == "catch" ) {
                
                
                var mon = entityById(this.entities,parameters.originator);
                if( mon != null ) {
                    parameters.function = "catch";
                    mon.SetCatchEvent(parameters);
                }
            } else if( parameters.type == "item" ) {
                if( parameters.originator ) {
                    var comp = [];
                    
                    var item = parameters.image+"";
                    var mon = parameters.monster+"";
                    mon = "000"+mon;
                    mon = mon.substring(mon.length-3,mon.length);
                    
                    
                    var text = parameters.username + " used an item";
                    var textWidth = SystemFont.Draw(text,0,0,"left",1,false);
                    
                    
                    comp.push({"text": text,"image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":40,"offsetY":10},"type":"bg", "scale":1});
                    comp.push({"text": null,"image":root + "images/items/" + item,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":30,"h":30,"data":{"offsetX":40+textWidth+5,"offsetY":+2},"type":"bg", "scale":1});
                    comp.push({"text": null,"image":root + "images/icons/" + mon + ".png","definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":32,"h":32,"data":{"offsetX":40+textWidth+32+10,"offsetY":-2},"type":"bg", "scale":1});
                    
                    var mon = entityById(this.entities,parameters.originator);
                    if( mon != null ) {
                        mon.hpLeft = parameters.hp;
                        mon.status = parameters.status;
                    }
                    
                    //10 seconds
                    new Notification({"life":10000,"components":comp});
                }
            } else if( parameters.type == "evolve" ) {
                
            } 
        }

	this.StaticUpdatePacket = function(parameters) {
		this.staticEntities = [];
		var ents = parameters.entities;
		for(var i=0;i<ents.length;i++) {
			var e = ents[i];
			entity = new Entity(e);
			this.staticEntities.push(entity);
		}

	}

	this.ChatAdd = function(username, text) {
		for(var i=0;i<this.entities.length;i++) {
			var ent = this.entities[i];
			if( ent.id == username ) {
				ent.Message(text);
				break;
			}
		}
	}

	this.EmoteAdd = function(parameters) {
		var style = parameters.style;
		var username = parameters.username;
		var id = parameters.id;

		for(var i=0;i<this.entities.length;i++) {
			var ent = this.entities[i];
			if( ent.id == username ) {
				ent.Emote(style);
				break;
			}
		}
	}


	this.UpdateEntities = function(parameters) {

		var ents = parameters.entities;
		for(var i=0;i<ents.length;i++) {
                    var e = ents[i];
                    if( e.id != character.id ) {
                            var entity = entityById(this.entities,e.id);
                            if( entity == null ) {
                                    if( parameters.action == "join" ) {
                                        entity = new Entity(e);
                                        entity.updated = true;
                                        this.entities.push(entity);

                                        entity.AreaJoin();
                                    }
                            } else {
                                    if( parameters.action == "leave" ) {
                                        var pos = this.entities.indexOf(entity);
                                        this.entities.splice(pos,1);
                                        this.addEntityAnimation(entity, {"type":"fade"});
                                        entity.AreaLeave();
                                    }
                            }
                    } else {
                        if( parameters.action == "leave" ) {
                            area.loading = true;
                        }
                    }
		}

	}

	this.addEntityAnimation = function(entity, options) {
		options.animationTimer = 0;
		options.animating = true;

		entity.animation = options;
		this.animationEntities.push(entity);
	}

	//positional update of entities on an area, Ignore if not already known.
	//we receive separate join and leave noticies for joining entities and leaving entities.
        /*
	this.UpdatePacket = function(parameters) {

		for(var i=0;i<this.entities.length;i++) {
			var entity = this.entities[i];
			entity.updated = false;
		}

		//received entity info
		var ents = parameters.entities;
		for(var i=0;i<ents.length;i++) {
			var e = ents[i];
			if( e.id != character.id ) {
				var entity = entityById(this.entities,e.id);
				if( entity == null ) {
                                    //Changed so that we no longer create entities here.
				} else {
                                    entity.target.x = e.tx;
                                    entity.target.y = e.ty;

                                    //if the distance between where we think they are and where they actually are is too great teleport them.
                                    if( Distance(entity.position.x,entity.position.y,e.x,e.y) > 5 ) {
                                            entity.position.x = e.x;
                                            entity.position.y = e.y;
                                    }

                                    entity.Face(e.d);
                                    entity.Packet(e);
                                    entity.updated = true;
				}
			} else {
				if( Distance(character.position.x,character.position.y,e.x,e.y) > 15 ) {
					character.position.x = e.x;
					character.position.y = e.y;
				}
			}
		}

		character.updated = true;
		//This may be redundant with how entities update
	}
        */

	this.Update = function() {
		for(var i=0;i<this.entities.length;i++) {
			var entity = this.entities[i];
			entity.Update();
		}

		this.frameTimer++;
		if( this.frameTimer == 5 ) {
			this.waterFrame++;
			if( this.waterFrame > 14 ) {
				this.waterFrame = 0;
			}
		}
		if( this.frameTimer > 10 ) {
			this.frame++;
			this.waterFrame++;
			this.frameTimer = 0;
			if( this.frame > 3 ) {
				this.frame = 0;
			}
			if( this.waterFrame > 14 ) {
				this.waterFrame = 0;
			}
		}

		//remove old animation entities.
		for(var i=this.animationEntities.length-1;i>=0;i--) {
			if( !this.animationEntities[i].animation.animating ) {
				this.animationEntities.splice(i,1);
			}
		}
	}

	this.Draw = function() {
            if( area.loading )
                return;

            //Draw layers Base, Decoration and Collision
            this.DrawLayer(this.base);
            if( this.decoration.length > 0 )
                this.DrawLayer(this.decoration);
            
            if( this.decoration_under.length > 0 )
                this.DrawLayer(this.decoration_under);
            
            if( this.decoration_over.length > 0 )
                this.DrawLayer(this.decoration_over);
            
            this.DrawLayer(this.collision);

            //Draw players

            //z-order sorting.
            var ordered = [];
            var iteration = this.entities.slice();
            iteration = iteration.concat(this.staticEntities);
            iteration = iteration.concat(this.animationEntities);
            var arrayLength = iteration.length;
            for(var i=0;i<arrayLength;i++) {
                    var mostSouth = 0;
                    var mostSouthIndex = 0;
                    for(var k=0;k<iteration.length;k++) {
                            var ent = iteration[k];
                            if( ent.position.y > mostSouth ) {
                                    mostSouth = ent.position.y;
                                    mostSouthIndex = k;
                            }
                    }
                    ordered.push(iteration[mostSouthIndex]);
                    iteration.splice(mostSouthIndex,1);
            }

            //render the z-ordered list
            for(var i=ordered.length-1;i>=0;i--) {
                    var entity = ordered[i]; 
                    entity.Draw();
            }

            //Draw layer Above
            this.DrawLayer(this.above);


            for(var i=ordered.length-1;i>=0;i--) {
                    var entity = ordered[i];
                    entity.DrawInterface();
            }
	}


	this.DrawLayer = function(layerData) {

		//topLeft
		var tileSize = parseInt(this.tileSize);
		var tileSizeBuffer = tileSize * scale;
		var tileset = this.tileset;
		var pos = {"x":  0 ,"y" :0};
                
                var scaleOffsetX = (canvasWidth*(1-scale)/2);
                var scaleOffsetY = (canvasHeight*(1-scale)/2);
                
		for(var x=0;x<this.width;x+=tileSize) {
			pos.x =  topLeft.x+x * scale;
			if( pos.x > -tileSizeBuffer + scaleOffsetX && pos.x < (canvasWidth - scaleOffsetX) + tileSizeBuffer ) {
				for(var y=0;y<this.height;y+=tileSize) {
					pos.y = topLeft.y+y * scale;
					if( pos.y > -tileSizeBuffer + scaleOffsetY && pos.y < (canvasHeight - scaleOffsetY) + tileSizeBuffer ) {
						var tile = this.Tile(layerData,parseInt(x/tileSize),parseInt(y/tileSize));
						if( tile > 0 ) {
							if( flowerTiles.includes(tile) ) {
								tile += this.frame;
							}
							if( tile == 3408 ) {	//water
								tile += this.waterFrame;
							}

							var tilesetTile = this.Tileset(tile);
							ctx.drawImage(tileset,(tilesetTile.x*tileSize* scale),(tilesetTile.y*tileSize* scale),tileSize* scale,tileSize* scale, pos.x,pos.y ,(tileSize * scale),(tileSize * scale));
						}
					}
				}
			}
		}
	}

	this.Tileset = function(tile) {
		var y = parseInt(tile/this.tilesetColumns);
		var x = ((tile/parseFloat(this.tilesetColumns))-y)*this.tilesetColumns;

		return {"x":x-1,"y":y};
	}

	this.Tile = function( data, x,  y) {
		var tilesWide = parseFloat(this.width) / parseFloat(this.tileSize);
		var pos = 0;
		if( y * tilesWide + x >= 0 && y * tilesWide + x < data.length ) {
			if( data ) {
				pos = (y * tilesWide) + x;
				return parseInt(data[pos]);
			}
		}
		return -1;
	}

	this.IsCollisionFree = function(position, collider) {

		var tile1 = this.Tile(this.collision, parseInt(position.x+(collider.x)/area.tileSize), parseInt(position.y+(collider.y)/area.tileSize) );
		var tile2 = this.Tile(this.collision, parseInt(position.x+(collider.x+collider.w)/area.tileSize), parseInt(position.y+(collider.y)/area.tileSize) );
		var tile3 = this.Tile(this.collision, parseInt(position.x+(collider.x)/area.tileSize), parseInt(position.y+(collider.y+collider.h)/area.tileSize) );
		var tile4 = this.Tile(this.collision, parseInt(position.x+(collider.x+collider.w)/area.tileSize), parseInt(position.y+(collider.y+collider.h)/area.tileSize) );

		if( tile1 <= 0 && tile2 <= 0 && tile3 <= 0 && tile4 <= 0 ) {
			return true;
		}

		return false;
	}

	this.ScreenToTile = function(x,y) {
            var position = {"x":parseInt((x-topLeft.x)/area.tileSize/scale),"y":parseInt((y-topLeft.y)/area.tileSize/scale)};
            return position;
	}


	this.Click = function(x,y,passive) {
            if( area.loading )
                return;
            
            if( scriptRunning() )
                return;

            if( !passive ) {
                for(var i=0;i<this.entities.length;i++) {
                    var entity = this.entities[i];
                    if( x >= entity.draw.x &&  x <= entity.draw.x+entity.size.w
                        && y >= entity.draw.y &&  y <= entity.draw.y+entity.size.h  ) {

                        var clickConsumed = entity.Click();
                        if( clickConsumed ) {
                                return true;
                        }
                    }
                }
            }

            //non tool click on space.
            var position = this.ScreenToTile(x,y);
            var target = {"x":(x-topLeft.x)/area.tileSize/scale-0.5,"y":(y-topLeft.y)/area.tileSize/scale-0.5};
            character.SetTarget(target);
	}


	var area = this;
	console.log("Area Loading: " + area.code);
	$.ajax({
		type: "GET", url: area.url,
		dataType: "xml",
		success: function(responseData, textStatus, jqXHR) {

			var mapData = responseData.childNodes[0];

			area.tileSize = mapData.getAttribute("tilewidth");
			area.width = mapData.getAttribute("width") * area.tileSize;
			area.height = mapData.getAttribute("height") * area.tileSize;
			area.tileCount = (area.width / area.tileSize) * (area.height / area.tileSize);

			area.base = [];
			area.decoration = [];
			area.decoration_under = [];
			area.decoration_over = [];
			area.collision = [];
			area.above = [];
			area.warps = [];


			for(var i=0;i<mapData.childNodes.length;i++) {
				var node = mapData.childNodes[i];

				if( node.nodeName == "tileset") {

					area.tilesetFile = root + "tilesets/" + node.getAttribute("name") + ".png";
					area.tilesetColumns = parseInt(node.getAttribute("columns"));
					area.tileset = resourceByKey(area.tilesetFile);
					if( area.tileset == null ) {
						area.tileset = new ResourceImage(area.tilesetFile,area.tilesetFile,true);
						screenResources.push(area.tileset);
						area.tileset = area.tileset.scaled;
					}

				} else if( node.nodeName == "layer") {

					var dataNode = firstChildNodeNamed("data",node);
					var data = getDataOfImmediateChild(dataNode);
					data = data.replace(/\r/i, '').replace(/\n/i, '').replace(/\t/i, '').trim();

					if( node.getAttribute("name") == "Collision" ) {
						area.collision = data.split(",");
					} else if( node.getAttribute("name") == "Above" ) {
						area.above = data.split(",");
					} else if( node.getAttribute("name") == "Decoration" ) {
						area.decoration = data.split(",");
					} else if( node.getAttribute("name") == "Decoration Under" ) {
						area.decoration_under = data.split(",");
					} else if( node.getAttribute("name") == "Decoration Over" ) {
						area.decoration_over = data.split(",");
					} else if( node.getAttribute("name") == "Base" ) {
						area.base = data.split(",");
					}

				} else if( node.nodeName == "objectgroup") {
					if( node.getAttribute("name").toLowerCase() == "warp" ) {
						area.warps = [];

						for (var k = 0; k < node.childNodes.length; k++) {
							var object = node.childNodes[k];

							if( object.nodeName != "#text" ) {
								var x1 = parseInt(parseInt(object.getAttribute("x"))/area.tileSize);
								var y1 = parseInt(parseInt(object.getAttribute("y"))/area.tileSize);

								var width = parseInt(object.getAttribute("width"))/area.tileSize;
								var height = parseInt(object.getAttribute("height"))/area.tileSize;

								var x2 = x1 + parseInt(width)+1;
								var y2 = y1 + parseInt(height)+1;

								/*
								//convert from bottom-up to top down
								var height = parseInt(height)+1;
								y1 -= height;
								var y2 = y1 + height;
								*/

								var data = object.getAttribute("type");

								area.warps.push(new Region(data, x1,y1,x2,y2));
							}

						}
					}
				}

			}

			area.loading = false;
			console.log("Area Loaded: " + area.code);
		},
		error: function (responseData, textStatus, errorThrown) {
			alert('GET failed.');
		}
    });

	return this;
}





function CenterMap()
{

	//only update if our character exists.
	if( character == null )
		return;
	var tileSize = parseFloat(area.tileSize) * scale;


	var MyX = character.position.x * tileSize;
	var MyY = character.position.y * tileSize;

	var xTmp = Math.max(MyX, canvasWidth / 2);
	var yTmp = Math.max(MyY, canvasHeight / 2);

	xTmp = Math.min(xTmp, area.width * scale - canvasWidth / 2);
	yTmp = Math.min(yTmp, area.height * scale - canvasHeight / 2);

	var actualPosition = new Object;
	actualPosition.X = xTmp;
	actualPosition.Y = yTmp;

	var centerOfView = new Object;
	centerOfView.X = canvasWidth / 2;
	centerOfView.Y = canvasHeight / 2;

	var viewPoint = new Object;
	viewPoint.X = centerOfView.X - actualPosition.X;
	viewPoint.Y = centerOfView.Y - actualPosition.Y;


	topLeft.x = parseInt(viewPoint.X);
	topLeft.y = parseInt(viewPoint.Y);

	if( topLeft.x > 0 ) {
		topLeft.x = topLeft.x / 2;
	}

	//User position should update as if it was an event, theirfore it should not be done in this function but rather in the gameEvent Class.
}


function Interface() {
	this.elements = [];
	this.elementsByKey = {};

        this.Contains = function(key) {
            if( this.elementsByKey[key] ) {
                return true;
            }
            return false;
        }
        this.Get = function(key) {
            if( this.elementsByKey[key] ) {
                return this.elementsByKey[key];
            }
            return null;
        }

	this.Click = function(x,y,passive) {
		if( passive )
			return;
		for(var i=0;i<this.elements.length;i++) {
			var element = this.elements[i];
			if( element.display ) {
				if( x >= element.display.x &&  x <= element.display.x+element.size.w
					&& y >= element.display.y &&  y <= element.display.y+element.size.h  ) {

					if( element.Click ) {
                                            var consume = element.Click(element);
                                            if( consume ) {
                                                return true;
                                            }
					}
				}
			}
		}
		return false;
	}

	this.Draw = function() {
		for(var i=0;i<this.elements.length;i++) {
			var elm = this.elements[i];
			elm.Draw();
		}
	}

	this.Remove = function(key) {
		var elm = this.elementsByKey[key];
                if( !elm )
                    return
		var index = this.elements.indexOf(elm);
		this.elements.splice(index,1);
		delete this.elementsByKey[key];
	}

	this.Add = function(key,elm) {
		this.elements.push(elm);
		this.elementsByKey[key] = elm;
	}

	return this;
}

function Element(data, onclick) {
	this.imageSource = data.image;
	this.definitionSource = data.definition;
	this.position = {"x":data.x,"y":data.y};
	this.size = {"w":data.w,"h":data.h};
	this.drawSize = {"w":data.w,"h":data.h};
        if( data.dw ) {
            this.drawSize = {"w":data.dw,"h":data.dh};
        }
        this.frameSize = {"w":this.drawSize.w,"h":this.drawSize.h};
	this.anchor = {"x":data.ax,"y":data.ay};
	this.data = data.data;
	this.type = data.type;
	this.text = data.text;
	this.rect = data.rect;

        this.alignX = "left";
        this.alignY = "top";
        if( data.alignX ) {
            this.alignX = data.alignX;
        }
        if( data.alignY ) {
            this.alignY = data.alignY;
        }
        
        this.ratio = "exact";
        if( data.ratio ) {
            this.ratio = data.ratio;
        }
        
	this.display = null;
        this.textWidth = 0;
        this.GetTextWidth = function() {
            return SystemFont.Draw(this.text,this.display.x,this.display.y,"left",this.scale,false);
        }

	this.scale = 1;
	if( data.scale ) {
		this.scale = data.scale;
	}

	this.SetImage = function(url) {
            this.imageSource = url;
	}
	this.SetText = function(text) {
            this.text = text;
	}

	//Setup click event
	this.Click = onclick;

	this.Draw = function() {
		this.display = {"x": this.position.x , "y": this.position.y };
		if( this.anchor.x > 0 ) {
			this.display.x = (canvasWidth * this.anchor.x) + this.display.x;
		}
		if( this.anchor.y > 0 ) {
			this.display.y = (canvasHeight * this.anchor.y) + this.display.y;
		}

                if( this.size.w == -1 ) {
                    var image = resourceByKey(this.imageSource);
                    if( image != null ) {
                        if( image.width ) {
                            this.size.w = image.width;
                            this.size.h = image.height;
                        } else {
                            return;
                        }
                    }
                }
                if( this.ratio == "aspect" ) {
                    if( this.size.w != -1 ) {
                        var dw = this.drawSize.w;
                        var dh = this.drawSize.h;

                        var maxSize = Math.max(this.size.w, this.size.h);
                        var maxDrawSize = Math.max(dw, dh);
                        var scale = maxDrawSize / maxSize;
                        
                        if( this.size.w > this.size.h ) {
                            this.drawSize.w = this.size.w * scale;
                            this.drawSize.h = this.size.h * scale;
                        } else {
                            this.drawSize.w = this.size.w * scale;
                            this.drawSize.h = this.size.h * scale;
                        }
                    }
                }

		//standard element drawing logic
		if( this.imageSource != null ) {
			var img = resourceByKey(this.imageSource);
			if( img == null ) {
                            img = new ResourceImage(this.imageSource,this.imageSource,false);
                            screenResources.push(img);
                            return;
			}
                        var addX = 0;
                        var addY = 0;
                        if( this.alignX != "left" ) {
                            if( this.alignX == "center" ) {
                                addX = (this.frameSize.w/2) - (this.drawSize.w/2);
                            } else if( this.alignX == "right" ) {
                                addX = this.frameSize.w - this.drawSize.w;
                            }
                        }
                        if( this.alignY != "top" ) {
                            if( this.alignY == "center" ) {
                                addY = (this.frameSize.h/2) - (this.drawSize.h/2);
                            } else if( this.alignY == "bottom" ) {
                                addY = this.frameSize.h - this.drawSize.h;
                            }
                        }
                        
			ctx.drawImage(img, 0,0, this.size.w,this.size.h, this.display.x+addX,this.display.y+addY,this.drawSize.w,this.drawSize.h );
		} else if( this.definitionSource != "" ) {
			var def = definitionByKey(this.definitionSource);

			def.Draw(ctx,this.definitionSource,"still",0,this.display.x,this.display.y,this.size.w,this.size.h);
		} else if( this.text ) {
			SystemFont.Draw(this.text,this.display.x,this.display.y,"left",this.scale);
		} else if( this.rect ) {
                        
                    ctx.fillStyle = this.rect;
                    ctx.fillRect(this.display.x,this.display.y,this.size.w,this.size.h);

                } else {
                    //alert("Unknown Element Type.");
                }
	}

	return this;
};

function Distance(x1,y1,x2,y2) {
	var cx = Math.abs(x1 - x2);
	var cy = Math.abs(y1 - y2);
	return Math.sqrt( (cx * cx) + (cy * cy) );
}

function Entity(data)
{
	this.position = {"x":data.x,"y":data.y};
	this.target = {"x":data.tx,"y":data.ty};
	this.draw = {"x":-900,"y":-900};
	this.animation = null;

	this.id = data.id;
	this.type = data.type;
	this.subtype = this.id.substring(0,1);

        this.alwaysAnimate = false;
	this.running = data.running == 0 ? false : true;

	this.direction = "";
        if( data.d == 0 ) {
            this.direction = "down";
        } else if( data.d == 1 ) {
            this.direction = "left"
        } else if( data.d == 2 ) {
            this.direction = "right";
        } else {
            this.direction = "up";
        } 
        //data.d == 0 ? "up" : "";
        
        
        
	this.frame = 0;
	this.frameTimer = 0;
	this.frameCount = 0;
        
        this.functionData = null;
        
        this.atl = data.atl;
        this.at = data.at;

	this.MonsterImagePath = function() {
		return root + "images/overworld/" + pad(parseInt(this.monsterId,10), 3) + (this.shiny ? "s" : "") + (this.formId > 0 ? "_" + this.formId : "") + ".png";
	}

	this.hpLeft = data.hp;
	this.hpLeftDraw = this.hpLeft;
	this.hpTotal = data.hpt;
	if( this.type == 0 || this.type == 2 ) {
		this.cape = data.cape;
		this.hat = data.hat;
                
		this.hair = data.hair;
		this.shirt = data.shirt;
		this.body = data.body;
		this.pants = data.pants;
		this.shoes = data.shoes;

		this.speed = data.s;

		var def = definitionByKey(this.body);
                if( def != null ) {

                    this.size = def.definition.size;
                    this.collider = def.definition.collider;
                } else {
                    this.collider = {"x": 20,"y": 32 ,"w":24,"h":24};
                    this.size = {"x": 0,"y": 0 ,"w":64,"h":64};
                }

	} else if( this.type == 1 ) {
		this.monsterId = data.monsterId;
		this.formId = data.formId;
		this.shiny = data.shiny;
		this.gender = data.gender;

		this.speed = data.s;

		this.imageKey = this.MonsterImagePath();
		this.image = new ResourceImage(this.imageKey,this.imageKey);
		screenResources.push(this.image);

		this.collider = {"x": 20,"y": 32 ,"w":24,"h":24};
		this.size = {"x": 0,"y": 0 ,"w":64,"h":64};
		this.frameCount = 4;
                
                if( this.type == 1 ) {
                    this.alwaysAnimate = monsterAnimated.indexOf(parseFloat(this.monsterId)) != -1;
                }
                
	} else if( this.type == 4 ) {
            this.plant = data.plant;
	}


	this.emoteStyle = null;
	this.emoteTimer = 0;
	this.emoteFrame = 0;
	this.Emote = function(style) {
		this.emoteStyle = style;
		this.emoteTimer = 0;
		this.emoteFrame = 0;
	}

	this.message = "";
	this.mmessageTimer = 0;
	this.Message = function(text) {
		this.message = text;
		this.mmessageTimer = 0;
	}

	this.SetTarget = function(target) {
		var packet = {"a":"target","p":target};
		var ent = this;
		ent.target = target;
		socketAdmin.Send(packet, function(response) {

		});
	}
        
        this.Packet = function(p) {
            if( this.type == 1 ) { //monster
                this.atl = p.atl;
                this.at = p.at;
                
                
            }
        }
        
        this.SetCatchEvent = function(parameters) {
            this.functionData = parameters;
            this.functionData.timer = 0;
        }

	this.Click = function() {
		var item = null;
		if( selectedItem != null ) {
			item = itemById(selectedItem);
		}

		if( item != null ) {
			if( this.type == 1 ) {
				if( item.scope == "CATCH") {
					if( this.subtype == "m" ) {
						itemSelect(0,"");	//unselect item

						var packet = {"a":"pokeball","p":{"t":this.id,"i":item.item_id}};
						socketAdmin.Send(packet, function(response) {

						});
					}
					return true; //take the click regardless of if the action is valid.
				} else if( item.scope == "HEAL") {
					itemSelect(0,"");	//unselect item

					//works regardless of the targets subtype.
					var packet = {"a":"item","p":{"t":this.id,"i":item.item_id}};
					socketAdmin.Send(packet, function(response) {

					});
					return true; //take the click regardless of if the action is valid.
				}
			}
		}

                if( this.type == 2 && keystate.space ) {
                    if( adminLevel > 1 ) {
                        return dialogNPCEditor(this);
                    }
                } else {
                    if( this.type == 2 ) {
                        console.log("User Triggered NPC: " + this.id);
                        var packet = {"a":"action","p":{"npc":this.id}};
                        socketAdmin.Send(packet, function(response) {
                            if( response.result == 1 ) {
                                //add the received data to the script queue.
                                
                            }
                        });
                        return true;
                    }
                }


		return false;
	}

	this.DrawInterface = function()
	{
		if( this.animation != null)
			return;

		var centerX = parseInt(this.draw.x + (this.size.w*scale/2),10);
		if( this.type == 0 ) {
                    if( this != character ) {
                            SystemFont.Draw(this.id, centerX, parseInt(this.draw.y)-5, "center");
                    }
                    //prioritize the emote
                    if( this.emoteStyle != null ) {
                        var def = definitionByKey(this.emoteStyle);
                        def.Draw(ctx,this.emoteStyle,"still",this.emoteFrame,this.draw.x+16*scale,this.draw.y-15*scale,32*scale,32*scale);
                    } else {
                        if( this.message != "" ) {
                            SystemFont.Draw(this.message, centerX, parseInt(this.draw.y)-20, "center");
                        }
                    }
		}

		//Draw te HP Bars.
		if( this.type == 1 ) {
                    
                    if( this.hpTotal != this.hpLeft && this.hpLeft < this.hpTotal ) {
                        var hpBarWidth = 28;
                        var hpBarHeight = 6;

                        ctx.fillStyle = '#333';
                        ctx.fillRect(centerX-(hpBarWidth/2),this.draw.y+5*scale,hpBarWidth,hpBarHeight);

                        var fillWidth = parseInt(this.hpLeftDraw / this.hpTotal * hpBarWidth,10);
                        ctx.fillStyle = '#3D3';
                        ctx.fillRect(centerX-(hpBarWidth/2)+1,this.draw.y+5*scale+1,fillWidth-2,hpBarHeight-2);
                    }
		}
	}

	this.AnimationStart = function() {
		if( this.animation.type == "fade" ) {
			this.animation.animationTimer += 0.2;
			if( this.animation.animationTimer > 1) {
				this.animation.animationTimer = 1;
				this.animation.animating = false;
			}
			ctx.globalAlpha = 1-this.animation.animationTimer;
			return true;
		}
		return false;
	}
        
	this.AreaJoin = function() {
            if( this.type == 1 ) {
                if( this.id.substring(0,1) == "p" ) {
                    this.at+=0;
                    var id = this.id.substring(1,this.id.length); 
                    var mon = TeamMemberByPk(id);
                    if( mon != null ) {
                        mon.SetAttackTimer(this.at,this.atl);
                    }
                }
            }
	}
	this.AreaLeave = function() {
            if( this.type == 1 ) {
                if( this.id.substring(0,1) == "p" ) {
                    this.at+=0;
                    var id = this.id.substring(1,this.id.length); 
                    var mon = TeamMemberByPk(id);
                    if( mon != null ) {
                        mon.SetAttackTimer(this.at,this.atl);
                    }
                }
            }
	}
        
	this.AnimationEnd = function() {
		if( this.animation.type == "fade" ) {
			ctx.globalAlpha = 1;
		}
	}

	this.Draw = function()
	{
            if( this.animation != null) {
                    var shouldRender = this.AnimationStart();
                    if( !shouldRender) {
                            return;
                    }
            }

            var offset = {"x":0,"y":-5};
            var tileSize = parseInt(area.tileSize);
            this.draw = {"x": topLeft.x+this.position.x*tileSize*scale+offset.x*scale, "y": topLeft.y+this.position.y*tileSize*scale+offset.y*scale};
            var draw = this.draw;

            if( this.type == 0  || this.type == 2) {
                    offset = {"x":0,"y":(-tileSize/2)};

                    var def = definitionByKey(this.body);
                    if( def )
                            def.Draw(ctx,this.body,this.direction,this.frame,draw.x,draw.y,this.size.w*scale,this.size.h*scale);

                    if( def != null ) {
                            this.frameCount = def.frameCount;
                    }
                    
                    if( this.cape != "" ) {
                        def = definitionByKey(this.cape);
                        if( def )
                                def.Draw(ctx,this.cape,this.direction,this.frame,draw.x,draw.y,this.size.w*scale,this.size.h*scale);
                    }
                    def = definitionByKey(this.shirt);
                    if( def )
                            def.Draw(ctx,this.shirt,this.direction,this.frame,draw.x,draw.y,this.size.w*scale,this.size.h*scale);

                    def = definitionByKey(this.pants);
                    if( def )
                            def.Draw(ctx,this.pants,this.direction,this.frame,draw.x,draw.y,this.size.w*scale,this.size.h*scale);

                    def = definitionByKey(this.shoes);
                    if( def )
                            def.Draw(ctx,this.shoes,this.direction,this.frame,draw.x,draw.y,this.size.w*scale,this.size.h*scale);

                    def = definitionByKey(this.hair);
                    if( def )
                            def.Draw(ctx,this.hair,this.direction,this.frame,draw.x,draw.y,this.size.w*scale,this.size.h*scale);

                    if( this.hat != "" ) {
                        def = definitionByKey(this.hat);
                        if( def )
                                def.Draw(ctx,this.hat,this.direction,this.frame,draw.x,draw.y,this.size.w*scale,this.size.h*scale);
                    }

            } else if( this.type == 1 ) { //monster

                    var frameSize = this.image.img.width/4;
                    this.draw.x -= frameSize/2 - (32*scale);
                    this.draw.y -= frameSize/2 - (32*scale);

                    var y = 0;
                    //pokemon
                    if( this.direction == "down" ) {
                        y = 0;
                    } else if( this.direction == "up" ) {
                        y = 3;
                    } else if( this.direction == "left" ) {
                        y = 1;
                    } else if( this.direction == "right" ) {
                        y = 2;
                    }
                    
                    if( this.functionData != null ) { 
                        var func = this.functionData.function;
                        if( func == "catch" ) {
                            //5 second timer.
                            this.functionData.timer++;
                            var x = (this.functionData.item_id-1)*41;
                            var y = 402; //open pball
                            
                            if( !this.functionData.iteration ) 
                                this.functionData.iteration = 0;
                            
                            if( !this.functionData.frameStep ) 
                                this.functionData.frameStep = 0;
                            
                            this.functionData.frameStep++;
                            if( this.functionData.frameStep > 2 ) {
                                this.functionData.frameStep = 0;
                                if( this.functionData.frame == 0 ) {
                                    this.functionData.frame = 0;
                                    //unsuccessful.
                                    console.log("Catch Fail Animation ended at: " + (this.functionData.timer*50));
                                    this.functionData = null;
                                    //draw the normal pokemon.
                                    ctx.drawImage(this.image.img, this.frame*frameSize,y*frameSize,frameSize,frameSize,draw.x,draw.y ,frameSize*scale,frameSize*scale);
                                    
                                    return;
                                }
                                if( !this.functionData.frame ) 
                                    this.functionData.frame = 41;
                                else {
                                    if( this.functionData.iteration < 3 && this.functionData.frame > 740  ) {
                                        //iterate again
                                        this.functionData.iteration++;
                                        this.functionData.frame = 41*2;
                                        console.log("Catch Animation iterate at: " + (this.functionData.timer*50));
                                        
                                    } else if( this.functionData.frame > 740  && this.functionData.success == 0 ) {
                                        this.functionData.frame = 0;
                                    } else if( this.functionData.frame > 896  ) {
                                        //successful
                                        //hold frame until the pokemon entity is removed.
                                        console.log("Catch Success Animation ended at: " + (this.functionData.timer*50));
                                    } else {
                                        this.functionData.frame += 41;
                                    }
                                }
                            }
                            
                            ctx.drawImage(pokeballs.img, x,this.functionData.frame,41,41,draw.x+12,draw.y+22,41*scale,41*scale);
                        }
                    } else {
                        ctx.drawImage(this.image.img, this.frame*frameSize,y*frameSize,frameSize,frameSize,draw.x,draw.y ,frameSize*scale,frameSize*scale);
                    }
                    
                    

            } else if( this.type == 4 ) {
                if( this.plant == "weed1" ) {
                        var tilesetTile = area.Tileset(324);
                        ctx.drawImage(area.tileset, tilesetTile.x*tileSize*scale, tilesetTile.y*tileSize*scale,tileSize* scale,tileSize* scale,draw.x,draw.y ,(tileSize * scale),(tileSize * scale));
                } else if( this.plant == "weed2" ) {
                        var tilesetTile = area.Tileset(308);
                        ctx.drawImage(area.tileset, tilesetTile.x*tileSize*scale, tilesetTile.y*tileSize*scale,tileSize* scale,tileSize* scale,draw.x,draw.y ,(tileSize * scale),(tileSize * scale));
                } else if( this.plant == "rock1" ) {
                        var tilesetTile = area.Tileset(277);
                        ctx.drawImage(area.tileset, tilesetTile.x*tileSize*scale, tilesetTile.y*tileSize*scale,tileSize* scale,tileSize* scale,draw.x,draw.y ,(tileSize * scale),(tileSize * scale));
                } else {
                        //check definitions

                }

            }


            if( this.animation != null) {
                var shouldRender = this.AnimationEnd();
                if( !shouldRender) {
                        return;
                }
            }
	}

	this.Update = function()    // Define Method
	{
		this.Reposition();

		//manage overhead chat messages
		if( this.message != "" ) {
			this.mmessageTimer++;
			if( this.mmessageTimer > 250 ) {
				this.message = "";
			}
		}

		//increment emoji styles
		if( this.emoteStyle != null ) {
			this.emoteTimer++;
			if( this.emoteTimer > 150 ) {
				this.emoteStyle = null;
			} else {
				if( this.emoteTimer/5 == parseInt(this.emoteTimer/5) ) {
					this.emoteFrame++;
					if( this.emoteFrame > 1 ) {
						this.emoteFrame = 0;
					}
				}
			}
		}

		//update the hp bar
		if( this.hpLeft > this.hpLeftDraw ) {
			this.hpLeftDraw++;
		} else if( this.hpLeft < this.hpLeftDraw ) {
			this.hpLeftDraw--;
		}
                
                if( this.type == 1 ) {
                    if( this.id.substring(0,1) == "p" ) {
                        this.at+=0.5;
                        if( this.at > this.atl )
                            this.at = this.atl;
                        var id = this.id.substring(1,this.id.length); 
                        var mon = TeamMemberByPk(id);
                        if( mon != null ) {
                            mon.SetAttackTimer(this.at,this.atl);
                        }
                    }
                }
	}


	this.Face = function(dir) {
		if( dir == 0 ) {
			this.direction = "up";
		} else if( dir == 1 ) {
			this.direction = "down";
		} else if( dir == 2 ) {
			this.direction = "left";
		} else if( dir == 3 ) {
			this.direction = "right";
		}
	}

        this.Step = function() {
            //update the frame
            this.frameTimer++;
            if( this.frameTimer > 3 ) {
                    this.frame++;
                    this.frameTimer = 0;
                    if( this.frame >= this.frameCount ) {
                            this.frame = 0;
                    }
            }
        }
        
	this.Reposition = function()    // Define Method
	{
            if( this.functionData != null ) { 
                return;
            }
            
		if( this.type == 4 ) {
			return;
		}

		if( this.target.x != this.position.x || this.target.y != this.position.y ) {
			var speed = this.speed/2;	//server timer is 50 we are 25.
			if( mobileMode )		//mobile mode uses a 50ms interval
				speed = this.speed;


			var change = {"x":0,"y":0};
			var update = {"x":0,"y":0};

			change.x = this.target.x - this.position.x;
			change.y = this.target.y - this.position.y;
			var dist = Math.sqrt( (change.x * change.x) + (change.y * change.y) );
			if (dist > speed)
			{
				var ratio = speed / dist;
				change.x = ratio * change.x;
				change.y = ratio * change.y;
				update.x = change.x + this.position.x;
				update.y = change.y + this.position.y;
			}
			else
			{
				update.x = this.target.x;
				update.y = this.target.y;
			}

			//check if its a valid move
			var walking = false;
			if( area.IsCollisionFree(update, this.collider) ) {
				this.position.x = update.x;
				this.position.y = update.y;
				walking = true;
			} else if( area.IsCollisionFree({"x":update.x,"y":this.position.y}, this.collider) ) {
				this.position.x = update.x;
				change.y = 0;
				walking = true;
			} else if( area.IsCollisionFree({"x":this.position.x,"y":update.y}, this.collider) ) {
				this.position.y = update.y;
				change.x = 0;
				walking = true;
			}

			if( this.alwaysAnimate || (walking && ( Math.abs(change.x) > 0.001 || Math.abs(change.y) > 0.001 )) )  {
                            this.Step();
			}

			//update the facing direction
			if( Math.abs(change.x) >  Math.abs(change.y) ) {
				if( change.x > 0 ) {
					this.direction = "right";
				} else if( change.x < 0 ) {
					this.direction = "left";
				}
			} else {
				if( change.y > 0 ) {
					this.direction = "down";
				} else if( change.y < 0 ) {
					this.direction = "up";
				}
			}

		} else {
                    if( this.alwaysAnimate ) {
                        this.Step();
                    }
                }
	}

	return this;
}

function pad(number, length) {

    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}

function Notification(payload) {
    //seconds
    notificationIdentifier++;
    this.id = notificationIdentifier;
    this.timer = 0;
    this.life = 3000;
    if( payload.life ) {
        this.life = payload.life;
    }
    
    this.components = payload.components;
    this.componentObjets = [];
    var notification = this;
    
    this.background = null;
    this.buttonClose = null;
    this.spacing = 39;
    
    this.Init = function() {
        var x = -320/2;
        
        var data = {"text": null,"image":root + "images/chat_background_short.png","definition":"","x":x,"y":-100,"ax":0.5,"ay":0,"w":320,"h":40,"data":{},"type":"bg", "scale":1};
        this.background = new Element(data, null);
        interfaceGame.Add("notification" + this.id + "background",this.background);
        
        data = {"text": null,"image":root + "images/cross.png","definition":"","x":x+300,"y":-100,"ax":0.5,"ay":0,"w":16,"h":16,"data":{},"type":"bg", "scale":1};
        this.buttonClose = new Element(data, this.Expire);
        interfaceGame.Add("notification" + this.id + "cross",this.buttonClose);
        
        for(var i=0;i<this.components.length;i++) {
            
            data = this.components[i]; //{"text": null,"image":root + "images/cross.png","definition":"","x":x+300,"y":-100,"ax":0.5,"ay":0,"w":16,"h":16,"data":{},"type":"bg", "scale":1};
            var callback = data.onclick;
            if( !callback ) 
                callback = null;
            this.componentObjets[i] = new Element(data, callback);
            interfaceGame.Add("notification" + this.id + "_" + i,this.componentObjets[i]);
            
            
            this.componentObjets[i].position.x = x+this.componentObjets[i].data.offsetX;
        }
        
    }
    this.Update = function(index) {
        this.timer += interval;
        if( this.timer >= this.life ) {
            this.Destory();
            return false;
        }
        
        var y = 10 + (index * this.spacing);
        this.background.position.y = y;
        this.buttonClose.position.y = y+10;
        
        for(var i=0;i<this.componentObjets.length;i++) {
            this.componentObjets[i].position.y = y + this.componentObjets[i].data.offsetY;
        }
        
        
        return true; //return the keep status.
    }
    
    this.Destory = function() {
        //cleanup, not remove from array
        interfaceGame.Remove("notification" + this.id + "background");
        interfaceGame.Remove("notification" + this.id + "cross");
        
        for(var i=0;i<this.componentObjets.length;i++) {
            interfaceGame.Remove("notification" + this.id + "_" + i);
        }
    }
    
    this.Expire = function() {
        notification.timer = notification.life;
        return true;
    }
    
    notifications.push(this);
    this.Init();
}

function Pokemon(payload) {
	this.pk = payload.pk;
	this.definition = {};
	this.isOut = false;
        var pokemon = this;

        this.barFullWidth = 80;
        this.atl = 0;
        this.at = 0;

        this.skillIndex = 0;

        this.SetOut = function(bOut) {
            this.isOut = bOut;
            
            var img = "/play/images/pokeball48.png";
            if( bOut ){
                img = "/play/images/pokeball48open.png";
            }
            if( this.definition.hp_left <= 0 ) {
                img = "/play/images/pokeball48fainted.png";
            }
            interfaceGame.Get("p" + this.definition.position + "pokeball").SetImage(img);
            
            var height = this.GetHeight();
            var spacer = this.GetSpacer();
            var size =  iconPokemon.length * (height + spacer);
            var y = this.GetPositionY();
            
            this.RemoveExtraMenu();
            if( bOut ) {
                
                //draw the extra menus.
                var data = {"text": null,"image":"/play/images/selection_background.png","definition":"","x":216,"y":y+4,"ax":0,"ay":0,"w":129,"h":70,"data":{"position":this.definition.position, "pk":this.pk},"type":""};
                var sprite = new Element(data, null);
                interfaceGame.Add("p" + this.definition.position + "selection",sprite);
                
                data = {"text": "1. " + this.definition.attack_1_name ,"image":null,"definition":"","x":235,"y":y+6,"ax":0,"ay":0,"w":129,"h":14,"data":{"position":this.definition.position, "pk":this.pk, "index":0},"type":"", "scale":0.75};
                sprite = new Element(data, this.SetPokemonAction);
                interfaceGame.Add("p" + this.definition.position + "attack_1_name",sprite);
                
                data = {"text": "2. " + this.definition.attack_2_name ,"image":null,"definition":"","x":235,"y":y+6+13,"ax":0,"ay":0,"w":129,"h":14,"data":{"position":this.definition.position, "pk":this.pk, "index":1},"type":"", "scale":0.8};
                sprite = new Element(data, this.SetPokemonAction);
                interfaceGame.Add("p" + this.definition.position + "attack_2_name",sprite);
                
                data = {"text": "3. " + this.definition.attack_3_name ,"image":null,"definition":"","x":235,"y":y+6+13+13,"ax":0,"ay":0,"w":129,"h":14,"data":{"position":this.definition.position, "pk":this.pk, "index":2},"type":"", "scale":0.8};
                sprite = new Element(data, this.SetPokemonAction);
                interfaceGame.Add("p" + this.definition.position + "attack_3_name",sprite);
                
                data = {"text": "4. " + this.definition.attack_4_name ,"image":null,"definition":"","x":235,"y":y+6+13+13+13,"ax":0,"ay":0,"w":129,"h":14,"data":{"position":this.definition.position, "pk":this.pk, "index":3},"type":"", "scale":0.8};
                sprite = new Element(data, this.SetPokemonAction);
                interfaceGame.Add("p" + this.definition.position + "attack_4_name",sprite);
                
                data = {"text": "5. Defend","image":null,"definition":"","x":235,"y":y+6+13+13+13+13,"ax":0,"ay":0,"w":129,"h":14,"data":{"position":this.definition.position, "pk":this.pk, "index":4},"type":"", "scale":0.8};
                sprite = new Element(data, this.SetPokemonAction);
                interfaceGame.Add("p" + this.definition.position + "attack_5_name",sprite);
                
                data = {"text": null,"image":"/play/images/tick.png","definition":"","x":220,"y":y+6+(this.skillIndex*13),"ax":0,"ay":0,"w":16,"h":16,"dw":12,"dh":12,"data":{"position":this.definition.position, "pk":this.pk},"type":""};
                sprite = new Element(data, null);
                interfaceGame.Add("p" + this.definition.position + "tick",sprite);
                
                
                
            } else {
                
            }
        }
        
        this.RemoveExtraMenu = function() {
            //hide the extra menus.
            interfaceGame.Remove("p" + this.definition.position + "selection");
            interfaceGame.Remove("p" + this.definition.position + "attack_1_name");
            interfaceGame.Remove("p" + this.definition.position + "attack_2_name");
            interfaceGame.Remove("p" + this.definition.position + "attack_3_name");
            interfaceGame.Remove("p" + this.definition.position + "attack_4_name");
            interfaceGame.Remove("p" + this.definition.position + "attack_5_name");
            interfaceGame.Remove("p" + this.definition.position + "tick");
                
        }
        
        this.SetLevel = function(level) {
            this.definition.level = parseFloat(level);
            interfaceGame.Get("p" + this.definition.position + "level").SetText("Lv." + this.definition.level);
        }
        
        this.ResetAttackTimer = function() {
            this.SetAttackTimer(0, this.atl);
        }
        
        this.SetAttackTimer = function(at, atl) {
            this.atl = atl;
            this.at = at;
            
            var atkBar = interfaceGame.Get("p" + this.definition.position + "atk");
            var width = (at / atl) * this.barFullWidth;
            atkBar.size.w = width;
        }

        this.Remove = function() {
            interfaceGame.Remove("p" + this.definition.position + "img");
            interfaceGame.Remove("p" + this.definition.position + "name");
            interfaceGame.Remove("p" + this.definition.position + "level");
            
            interfaceGame.Remove("p" + this.definition.position + "health");
            interfaceGame.Remove("p" + this.definition.position + "healthBackground");
            
            interfaceGame.Remove("p" + this.definition.position + "exp");
            interfaceGame.Remove("p" + this.definition.position + "expBackground");
            
            interfaceGame.Remove("p" + this.definition.position + "atk");
            interfaceGame.Remove("p" + this.definition.position + "atkBackground");
            
            interfaceGame.Remove("p" + this.definition.position + "pokeball");
            interfaceGame.Remove("p" + this.definition.position + "gender");
            
            //hide the extra menus.
            interfaceGame.Remove("p" + this.definition.position + "selection");
            interfaceGame.Remove("p" + this.definition.position + "attack_1_name");
            interfaceGame.Remove("p" + this.definition.position + "attack_2_name");
            interfaceGame.Remove("p" + this.definition.position + "attack_3_name");
            interfaceGame.Remove("p" + this.definition.position + "attack_4_name");
            interfaceGame.Remove("p" + this.definition.position + "attack_5_name");
            interfaceGame.Remove("p" + this.definition.position + "tick");

        }
        this.GetHpTotal = function() {
            return this.definition.hp_total;
        }
        this.GetHp = function() {
            return this.definition.hp_left;
        }
        this.SetHpTotal = function(hp_total) {
            this.definition.hp_total = hp_total;
        }
        
        this.SetHp = function(hp_left) {
            this.definition.hp_left = hp_left;
            
            var healthBar = interfaceGame.Get("p" + this.definition.position + "health");
            var width = (this.definition.hp_left / this.definition.hp_total) * this.barFullWidth;
            healthBar.size.w = width;
            
            if( hp_left <= 0 ) {
                this.SetOut(false);
            }
        }
        this.SetExp = function(exp, expLimit) {
            this.definition.exp = exp;
            this.definition.expLimit = expLimit;
            
            var expLevel = this.definition.level * this.definition.level * this.definition.level;
            
            
            if( this.definition.exp > this.definition.expLimit )
                this.definition.exp = this.definition.expLimit;
            
            var expBar = interfaceGame.Get("p" + this.definition.position + "exp");
            var width = ((this.definition.exp-expLevel) / (this.definition.expLimit-expLevel)) * this.barFullWidth;
            expBar.size.w = width;
            
        }

	this.Update = function(payload) {
            this.definition = payload;
            this.LineUp(this.definition);
	}

        this.GetHeight = function() {
            return 70;
        }
        this.GetSpacer = function() {
            return 5;
        }
        this.GetPositionY = function() {
            var height = this.GetHeight();
            var spacer = this.GetSpacer();
            var size =  iconPokemon.length * (height + spacer);
            var y = 10+((height+spacer) * (parseFloat(this.definition.position)-1)) + spacer/2 -4;
            return y;
        }
        
        this.SetImageAndName = function(data) {
            var url = root + "images/standard/" + data.pokemon_id + ".png";
            
            var monImage = interfaceGame.Get("p" + this.definition.position + "img");
            monImage.SetImage(url);
            
            var monName = interfaceGame.Get("p" + this.definition.position + "name");
            monName.text = data.name;
        }
        
	this.LineUp = function(pokemon) {
            
            var pokemon_id = pokemon.pokemon_id;
            var pokemon_id_padded = pad(pokemon_id, 3);
            var name = pokemon.name.toLowerCase().trim()+".gif";

            var height = this.GetHeight();
            var spacer = this.GetSpacer();
            var size =  iconPokemon.length * (height + spacer);
            var y = this.GetPositionY();

            var url = root + "images/standard/" + pokemon_id + ".png";

            if( !interfaceGame.Contains("p" + pokemon.position + "img") ) {
                data = {"text": null,"image":url,"definition":"","x":0,"y":y,"ax":0,"ay":0,"w":94,"h":94,"ratio":"aspect","dw":70,"dh":70,"alignX":"center","alignY":"center","data":{"position":pokemon.position, "pk":this.pk},"type":"image"};
                var sprite = new Element(data, function() {return true;});
                interfaceGame.Add("p" + pokemon.position + "img",sprite);
                
                data = {"text": pokemon.name,"image":null,"definition":"","x":80,"y":y+10,"ax":0,"ay":0,"w":0,"h":0,"data":{"position":pokemon.position, "pk":this.pk},"type":"text"};
                sprite = new Element(data, function() {return true;});
                interfaceGame.Add("p" + pokemon.position + "name",sprite);
                
                data = {"text": "Lv." + pokemon.level,"image":null,"definition":"","x":80,"y":y+30,"ax":0,"ay":0,"w":0,"h":0,"data":{"position":pokemon.position, "pk":this.pk},"type":"text", "scale":0.75};
                sprite = new Element(data, function() {return true;});
                interfaceGame.Add("p" + pokemon.position + "level",sprite);
                
                data = {"rect":"#333" ,"text": null,"image":null,"definition":"","x":80,"y":y+45,"ax":0,"ay":0,"w":80,"h":4,"data":{"position":pokemon.position, "pk":this.pk},"type":"text", "scale":0.75};
                sprite = new Element(data, function() {return true;});
                interfaceGame.Add("p" + pokemon.position + "healthBackground",sprite);
                
                data = {"rect":"#b2e29e" ,"text": null,"image":null,"definition":"","x":80,"y":y+45,"ax":0,"ay":0,"w":80,"h":4,"data":{"position":pokemon.position, "pk":this.pk},"type":"text", "scale":0.75};
                sprite = new Element(data, function() {return true;});
                interfaceGame.Add("p" + pokemon.position + "health",sprite);
                
                data = {"rect":"#333" ,"text": null,"image":null,"definition":"","x":80,"y":y+53,"ax":0,"ay":0,"w":80,"h":4,"data":{"position":pokemon.position, "pk":this.pk},"type":"text", "scale":0.75};
                sprite = new Element(data, function() {return true;});
                interfaceGame.Add("p" + pokemon.position + "expBackground",sprite);
                
                data = {"rect":"#5e9ef1" ,"text": null,"image":null,"definition":"","x":80,"y":y+53,"ax":0,"ay":0,"w":80,"h":4,"data":{"position":pokemon.position, "pk":this.pk},"type":"text", "scale":0.75};
                sprite = new Element(data, function() {return true;});
                interfaceGame.Add("p" + pokemon.position + "exp",sprite);
                
                data = {"rect":"#333" ,"text": null,"image":null,"definition":"","x":80,"y":y+61,"ax":0,"ay":0,"w":80,"h":4,"data":{"position":pokemon.position, "pk":this.pk},"type":"text", "scale":0.75};
                sprite = new Element(data, function() {return true;});
                interfaceGame.Add("p" + pokemon.position + "atkBackground",sprite);
                
                data = {"rect":"#f15e5e" ,"text": null,"image":null,"definition":"","x":80,"y":y+61,"ax":0,"ay":0,"w":80,"h":4,"data":{"position":pokemon.position, "pk":this.pk},"type":"text", "scale":0.75};
                sprite = new Element(data, function() {return true;});
                interfaceGame.Add("p" + pokemon.position + "atk",sprite);
                
                data = {"text": null,"image":"/play/images/pokeball48.png","definition":"","x":170,"y":y+15,"ax":0,"ay":0,"w":32,"h":48,"data":{"position":pokemon.position, "pk":this.pk},"type":"menu"};
                if( this.isOut ){
                    data.image = "/play/images/pokeball48open.png";
                }
                sprite = new Element(data, togglePokemon);
                interfaceGame.Add("p" + pokemon.position + "pokeball",sprite);
                
                data = {"text": null,"image":"/play/images/"+(pokemon.gender=="m"?"male":"female")+".png","definition":"","x":195,"y":y+10,"ax":0,"ay":0,"w":32,"h":48,"data":{"position":pokemon.position, "pk":this.pk},"type":"menu"};
                sprite = new Element(data, null);
                interfaceGame.Add("p" + pokemon.position + "gender",sprite);
                
                
                this.SetHp(this.definition.hp_left);
                this.SetExp(this.definition.exp,this.definition.expLimit);
            }
	}
        
        this.SetPokemonAction = function(target) {
            var atk = target.data.index;
            pokemon.skillIndex = atk;
            
            //send the change to the server
            var packet = {"a":"skill","p":{"pk":pokemon.pk,"index":pokemon.skillIndex}};
            socketAdmin.Send(packet, function(response) {
                if( response.result == 1 ) {
                    //add the received data to the script queue.
                }
            });
            
            //change the render position of the tick
            var height = pokemon.GetHeight();
            var spacer = pokemon.GetSpacer();
            var size =  iconPokemon.length * (height + spacer);
            var y = pokemon.GetPositionY();
            var tick = interfaceGame.Get("p" + pokemon.definition.position + "tick");
            tick.position.y = y+6+(pokemon.skillIndex*13);
            return true;
        }

	this.Name = function() {
		return this.definition.name;
	}

	this.Level = function() {
		return parseInt(this.definition.level,10);
	}

	this.Animated = function() {
		var str = "/play/images/animated/";
		if( this.definition.special == "shiny" ) {
			str += "front-shiny/";
		} else {
			str += "front-shiny/";
		}
		str += this.Name().toLowerCase().trim() + ".gif";
		return str;
	}
        
	this.Update(payload);
        
        if( area != null ) {
            var ent = entityById(area.entities,"p"+this.pk);
            if( ent != null ) {
                ent.hpLeft = this.GetHp();
            }
        }
        
	return this;
}

function togglePokemon() {
    var ent = this;
    target = {"position":ent.data.position+"","pk":ent.data.pk+""};
    if( pokemonTeam[ent.data.position-1].isOut ) {
        target.action = "withdraw";
    } else {
        target.action = "sendout";
    }
    
    var packet = {"a":"call","p":target};
    socketAdmin.Send(packet, function(response) {
        if( response.result == 1 ) {
            pokemonTeam[ent.data.position-1].SetOut(response.isOut);
        }
    });
    return true;
}
/*
function togglePokemon(pos,pk) {
	var position = parseInt(pos,10)-1;
	var pokemon = pokemonTeam[position];
	if( pokemon != null ) {
		target = {"position":pos,"pk":pk};
		if( pokemon.isOut ) {
			target.action = "withdraw";
		} else {
			target.action = "sendout";
		}

		var packet = {"a":"call","p":target};
		var ent = this;
		socketAdmin.Send(packet, function(response) {
			if( response.result == 1 ) {
				pokemon.isOut = response.isOut;
				dialogUpdate("p"+pos, pokemon.infoHTML());
			}
		});
	}
}
*/

function TeamMemberByPk(pk) {
    for(var i=0;i<pokemonTeam.length;i++) {
        if( pokemonTeam[i] != null ) {
            if( parseFloat(pokemonTeam[i].pk) == parseFloat(pk) ) {
                return pokemonTeam[i];
            }
        }
    }
    return null;
}

function TeamUpdate(payload) {
    for(var pos = 0;pos < 6;pos++) {
        var posStr = pos + 1 + '';
        if( payload[posStr] ) {
            var isSame = false;
            
            if( pokemonTeam[pos] != null ) {
                if( pokemonTeam[pos].pk == payload[posStr].pk ) {
                    isSame = true;
                }
                if( !isSame ) {
                    pokemonTeam[pos].Remove();
                }
            }
            if( !isSame ) {
                pokemonTeam[pos] = new Pokemon(payload[posStr]);
            } else {
                pokemonTeam[pos].SetLevel(payload[posStr].level);
                pokemonTeam[pos].SetHpTotal(payload[posStr].hp_total);
                pokemonTeam[pos].SetHp(payload[posStr].hp_left);
                
                pokemonTeam[pos].SetExp(payload[posStr].exp,payload[posStr].expLimit);
                pokemonTeam[pos].SetAttackTimer(payload[posStr].at,payload[posStr].atl);
                pokemonTeam[pos].SetOut(pokemonTeam[pos].isOut);
                //NEEDS TO CHANGE POKEMON IMAGES
                pokemonTeam[pos].SetImageAndName(payload[posStr]);
            }
            if( area != null ) {
                //update entity hp
                var ent = entityById(area.entities,"p"+pokemonTeam[pos].pk);
                if( ent != null ) {
                    ent.hpLeft = pokemonTeam[pos].GetHp();
                    ent.hpTotal = pokemonTeam[pos].GetHpTotal();
                    ent.monsterId = payload[posStr].pokemon_id;
                    ent.imageKey = ent.MonsterImagePath();
                    ent.image = new ResourceImage(ent.imageKey,ent.imageKey);
                }
            }
        } else {
            if( pokemonTeam[pos] != null ) {
                pokemonTeam[pos].Remove();
            }
            pokemonTeam[pos] = null;
        }
    }
    TeamPanelUpdate();
}

function TeamPanelUpdate() {
	for(var pos = 1; pos < 6;pos++) {
		if( pokemonTeam[pos] == null ) {
			iconPokemon[pos].SetImage("/play/images/0.png");
		} else {
			iconPokemon[pos].SetImage("/play/images/lineup_background.png");
		}
	}
}

function ItemsUpdate(payload) {
    if( payload.result == 1 ) {
        items = payload.items;
        if( dialogExists("backpack") ) {
            dialogUpdateBackpack();
        }
        money = parseInt(payload.money,10);
    }
}

function monsterIconUrl(monId) {
	return "/play/images/icons/" + pad(monId+"",3,"0") + ".png";
}   
function monsterIcon(monId) {
	return "<img src='" + monsterIconUrl(monId) + "'/>";
}



function ProcessAttack(payload) {
	if( area == null )
		return;

        var attackerId = payload.from;
	var attacker = entityById(area.entities, attackerId);

        if( attackerId.substring(0,1) == "p" ) {
            var pk = attackerId.substring(1,attackerId.length);
            var mon = TeamMemberByPk(pk);
            if( mon != null ) {
                mon.ResetAttackTimer();
                attacker.at = 0;
            }
        }

	for(var i=0;i<payload.to.length;i++) {
            var targetId = payload.to[i].id;
            
            
            var ent = entityById(area.entities,targetId);
            if( ent != null ) {
                ent.hpLeft = payload.to[i].hp;
                
                if( targetId.substring(0,1) == "p" ) {
                    //update the pokemon on the teams hp.
                    var id = targetId.substring(1,targetId.length);
                    var mon = TeamMemberByPk(id);
                    if( mon != null ) {
                        mon.SetHp(ent.hpLeft);
                    }
                }
                
                //var message = monsterIcon(attacker.monsterId) + " attacked " + monsterIcon(ent.monsterId) + " with " + payload.with + " for " + Math.abs(payload.to[i].delta) + " damage.";
                //ChatroomAppendDirectMessage(message);
                
                var comp = [];
                comp.push({"text": null,"image":monsterIconUrl(attacker.monsterId),"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":30,"h":30,"data":{"offsetX":34,"offsetY":-2},"type":"bg", "scale":1});
                comp.push({"text": "attacked","image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":66,"offsetY":13},"type":"bg", "scale":0.75});
                comp.push({"text": null,"image":monsterIconUrl(ent.monsterId),"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":32,"h":32,"data":{"offsetX":105,"offsetY":-2},"type":"bg", "scale":1});
                comp.push({"text": " with " + payload.with + " for " + Math.abs(payload.to[i].delta) + " damage","image":null,"definition":"","x":1,"y":1,"ax":0.5,"ay":0,"w":16,"h":16,"data":{"offsetX":137,"offsetY":13},"type":"bg", "scale":0.75});
                
                //10 seconds
                new Notification({"life":4000,"components":comp});
                
            }
	}

}


function scriptStart() {    //runs at the start of every line
    //draw assets for the script action
    var line = script[0];
    if( line.action == "talk" ) {
        
        var data = {"text": null,"image":root + "images/chat_background.png","definition":"","x":-160,"y":-80,"ax":0.5,"ay":1,"w":320,"h":70,"data":{},"type":"bg", "scale":1};
        var sprite = new Element(data, function() {return true;});
        interfaceGame.Add("npcTalk",sprite);

        data = {"text":line.line1.substring(0,1),"image":null,"definition":"","x":-85,"y":-65,"ax":0.5,"ay":1,"w":320,"h":80,"data":{},"type":"text", "scale":1};
        if( line.line2.trim() == "" ) {
            data.y = -55;
        }
        sprite = new Element(data, function() {return true;});
        interfaceGame.Add("npcTalkText1",sprite);
        line.sprite1 = sprite;
        
        data = {"text":"   ","image":null,"definition":"","x":-85,"y":-45,"ax":0.5,"ay":1,"w":320,"h":80,"data":{},"type":"text", "scale":1};
        sprite = new Element(data, function() {return true;});
        interfaceGame.Add("npcTalkText2",sprite);
        line.sprite2 = sprite;
        
        line.timer = 0;
        line.letter = 1;
    } else if( line.action == "choice" ) {
        //{line: "Don't you agree?", options: Array[2], action: "choice", token: "042a9d3b2e686a193ed32846cf0efce0"}
        var data = {"text": null,"image":root + "images/chat_background.png","definition":"","x":-160,"y":-80,"ax":0.5,"ay":1,"w":320,"h":70,"data":{},"type":"bg", "scale":1};
        var sprite = new Element(data, function() {return true;});
        interfaceGame.Add("npcTalk",sprite);

        data = {"text":line.line,"image":null,"definition":"","x":-85,"y":-55,"ax":0.5,"ay":1,"w":320,"h":60,"data":{},"type":"text", "scale":1};
        sprite = new Element(data, function() {return true;});
        interfaceGame.Add("npcTalkText1",sprite);
        line.sprite1 = sprite;
        
        //setup choices
        var maxHeight = line.options.length * 45 + 35;
        line.optionSprites = [];
        for(var k=0;k<line.options.length;k++) {
            
            data = {"text": null,"image":root + "images/chat_background_short.png","definition":"","x":-160,"y":-65 - (maxHeight - (k * 45)),"ax":0.5,"ay":1,"w":320,"h":40,"data":{},"type":"bg", "scale":1};
            sprite = new Element(data, function() {
                //define the callback function.
                var packet = {"a":"action","p":{"npc":line.npc,"token":line.token,"response":this.value}};
                socketAdmin.Send(packet, function(response) {
                    if( response.result == 1 ) {
                        //add the received data to the script queue.
                    }
                });
                
                scriptPop();
                return true;
            });
            sprite.value = line.options[k];
            interfaceGame.Add("npcOptionBg" + k,sprite);
            line.optionSprites[k] = sprite;
            
            data = {"text":line.options[k],"image":null,"definition":"","x":-85,"y":-55 -(maxHeight - (k * 45)),"ax":0.5,"ay":1,"w":320,"h":80,"data":{},"type":"text", "scale":1};
            sprite = new Element(data, function() {return false;});
            interfaceGame.Add("npcOptionText" + k,sprite);
            line.optionSprites[k] = sprite;
            
        }
    } else if( line.action == "shop" ) {
        dialogPokemart(line.items);
    } else if( line.action == "lab" ) {
        dialogLab(line.team,line.storage);
    } else if( line.action == "storage" ) {
        dialogStorage(line.team,line.storage);
    } else {
        alert("Unknown Line Action");
    }
}
function scriptFinish() {   //runs at the end of every line
    //clean up assets for the script action
    var line = script[0];
    if( line.action == "talk" ) {
        interfaceGame.Remove("npcTalk");
        interfaceGame.Remove("npcTalkText1");
        interfaceGame.Remove("npcTalkText2");
        
    } else if( line.action == "choice" ) {
        interfaceGame.Remove("npcTalk");
        interfaceGame.Remove("npcTalkText1");
        //cleanup
        for(var k=0;k<line.options.length;k++) {
            interfaceGame.Remove("npcOptionText" + k);
            interfaceGame.Remove("npcOptionBg" + k);
        }
    } else if( line.action == "shop" ) {
        //do nothing.
    } else if( line.action == "storage" ) {
        //do nothing.
    } else if( line.action == "lab" ) {
        //do nothing.
    } else {
        alert("Unknown Line Action");
    }
}
function scriptPop() {      //responsible for changing lines
    scriptFinish(); //wrap up the current line
    script.splice(0,1);
    if( script.length > 0 ) {
        scriptStart();
    }
}

function scriptRunning() {
    if( script.length == 0 )
        return false;
    return true;
}
function scriptClick() {   //runs every click
    //script timers.
    if( script.length == 0 )
        return;
    
    var line = script[0];
    if( line.action == "talk" ) {
        if( line.letter <= line.line1.length ) {
            line.letter = line.line1.length-1;
        } else if( line.letter <= line.line1.length + line.line2.length ) {
            line.letter = line.line1.length + line.line2.length-1;
        } else {
            scriptPop();
        }
        return true;    //canabalize the click
    } else if( line.action == "choice" ) {
        return false;    //canabalize the click
    }
    return false;
}
function scriptUpdate() {   //runs every update
    //script timers.
    if( script.length == 0 )
        return;
    
    var line = script[0];
    if( line.action == "talk" ) {
        line.timer++;
        if( line.timer > 3 ) {
            //display another letter.
            line.letter++;
            if( line.letter <= line.line1.length + line.line2.length ) {
                if( line.letter >= line.line1.length ) {
                    line.sprite1.SetText(line.line1);
                    line.sprite2.SetText(line.line2.substring(0,line.letter-line.line1.length));
                } else {
                    line.sprite1.SetText(line.line1.substring(0,line.letter));
                    line.sprite2.SetText("");
                }
            }
            line.timer = 0;
        }
    } else if( line.action == "choice" ) {
        line.timer++;
        if( line.timer > 3 ) {
            //display another letter.
            line.letter++;
            if( line.letter >= line.line.length ) {
                line.sprite1.SetText(line.line);
            } else {
                line.sprite1.SetText(line.line.substring(0,line.letter));
            }
            line.timer = 0;
        }
    } else {
        
    }
}




var pokemonList = [{"id":1,"name":"Bulbasaur","rarity":"Super Rare"},
{"id":2,"name":"Ivysaur","rarity":""},
{"id":3,"name":"Venusaur","rarity":""},
{"id":4,"name":"Charmander","rarity":"Super Rare"},
{"id":5,"name":"Charmeleon","rarity":""},
{"id":6,"name":"Charizard","rarity":""},
{"id":7,"name":"Squirtle","rarity":"Super Rare"},
{"id":8,"name":"Wartortle","rarity":""},
{"id":9,"name":"Blastoise","rarity":""},
{"id":10,"name":"Caterpie","rarity":"Very Common"},
{"id":11,"name":"Metapod","rarity":""},
{"id":12,"name":"Butterfree","rarity":"Common"},
{"id":13,"name":"Weedle","rarity":"Very Common"},
{"id":14,"name":"Kakuna","rarity":""},
{"id":15,"name":"Beedrill","rarity":"Common"},
{"id":16,"name":"Pidgey","rarity":"Very Common"},
{"id":17,"name":"Pidgeotto","rarity":""},
{"id":18,"name":"Pidgeot","rarity":""},
{"id":19,"name":"Rattata","rarity":"Very Common"},
{"id":20,"name":"Raticate","rarity":""},
{"id":21,"name":"Spearow","rarity":"Common"},
{"id":22,"name":"Fearow","rarity":""},
{"id":23,"name":"Ekans","rarity":"Common"},
{"id":24,"name":"Arbok","rarity":""},
{"id":25,"name":"Pikachu","rarity":""},
{"id":26,"name":"Raichu","rarity":""},
{"id":27,"name":"Sandshrew","rarity":"Common"},
{"id":28,"name":"Sandslash","rarity":""},
{"id":29,"name":"Nidoran","rarity":"Common"},
{"id":30,"name":"Nidorina","rarity":""},
{"id":31,"name":"Nidoqueen","rarity":""},
{"id":32,"name":"Nidoran","rarity":"Common"},
{"id":33,"name":"Nidorino","rarity":""},
{"id":34,"name":"Nidoking","rarity":""},
{"id":35,"name":"Clefairy","rarity":"Rare"},
{"id":36,"name":"Clefable","rarity":""},
{"id":37,"name":"Vulpix","rarity":"Rare"},
{"id":38,"name":"Ninetales","rarity":""},
{"id":39,"name":"Jigglypuff","rarity":"Rare"},
{"id":40,"name":"Wigglytuff","rarity":""},
{"id":41,"name":"Zubat","rarity":"Very Common"},
{"id":42,"name":"Golbat","rarity":""},
{"id":43,"name":"Oddish","rarity":"Common"},
{"id":44,"name":"Gloom","rarity":""},
{"id":45,"name":"Vileplume","rarity":""},
{"id":46,"name":"Paras","rarity":"Rare"},
{"id":47,"name":"Parasect","rarity":""},
{"id":48,"name":"Venonat","rarity":"Common"},
{"id":49,"name":"Venomoth","rarity":""},
{"id":50,"name":"Diglett","rarity":"Rare"},
{"id":51,"name":"Dugtrio","rarity":""},
{"id":52,"name":"Meowth","rarity":"Common"},
{"id":53,"name":"Persian","rarity":""},
{"id":54,"name":"Psyduck","rarity":"Common"},
{"id":55,"name":"Golduck","rarity":""},
{"id":56,"name":"Mankey","rarity":"Very Rare"},
{"id":57,"name":"Primeape","rarity":""},
{"id":58,"name":"Growlithe","rarity":"Common"},
{"id":59,"name":"Arcanine","rarity":""},
{"id":60,"name":"Poliwag","rarity":"Rare"},
{"id":61,"name":"Poliwhirl","rarity":""},
{"id":62,"name":"Poliwrath","rarity":""},
{"id":63,"name":"Abra","rarity":"Very Rare"},
{"id":64,"name":"Kadabra","rarity":""},
{"id":65,"name":"Alakazam","rarity":""},
{"id":66,"name":"Machop","rarity":"Very Rare"},
{"id":67,"name":"Machoke","rarity":""},
{"id":68,"name":"Machamp","rarity":""},
{"id":69,"name":"Bellsprout","rarity":"Common"},
{"id":70,"name":"Weepinbell","rarity":""},
{"id":71,"name":"Victreebel","rarity":""},
{"id":72,"name":"Tentacool","rarity":"Common"},
{"id":73,"name":"Tentacruel","rarity":""},
{"id":74,"name":"Geodude","rarity":"Common"},
{"id":75,"name":"Graveler","rarity":""},
{"id":76,"name":"Golem","rarity":""},
{"id":77,"name":"Ponyta","rarity":"Rare"},
{"id":78,"name":"Rapidash","rarity":""},
{"id":79,"name":"Slowpoke","rarity":"Very Rare"},
{"id":80,"name":"Slowbro","rarity":""},
{"id":81,"name":"Magnemite","rarity":"Rare"},
{"id":82,"name":"Magneton","rarity":""},
{"id":83,"name":"Farfetchd","rarity":"Rare"},
{"id":84,"name":"Doduo","rarity":"Common"},
{"id":85,"name":"Dodrio","rarity":""},
{"id":86,"name":"Seel","rarity":"Very Rare"},
{"id":87,"name":"Dewgong","rarity":""},
{"id":88,"name":"Grimer","rarity":"Very Rare"},
{"id":89,"name":"Muk","rarity":""},
{"id":90,"name":"Shellder","rarity":"Rare"},
{"id":91,"name":"Cloyster","rarity":""},
{"id":92,"name":"Gastly","rarity":"Rare"},
{"id":93,"name":"Haunter","rarity":""},
{"id":94,"name":"Gengar","rarity":""},
{"id":95,"name":"Onix","rarity":"Very Rare"},
{"id":96,"name":"Drowzee","rarity":"Rare"},
{"id":97,"name":"Hypno","rarity":""},
{"id":98,"name":"Krabby","rarity":"Rare"},
{"id":99,"name":"Kingler","rarity":""},
{"id":100,"name":"Voltorb","rarity":"Rare"},
{"id":101,"name":"Electrode","rarity":""},
{"id":102,"name":"Exeggcute","rarity":"Common"},
{"id":103,"name":"Exeggutor","rarity":""},
{"id":104,"name":"Cubone","rarity":"Rare"},
{"id":105,"name":"Marowak","rarity":""},
{"id":106,"name":"Hitmonlee","rarity":""},
{"id":107,"name":"Hitmonchan","rarity":""},
{"id":108,"name":"Lickitung","rarity":"Very Rare"},
{"id":109,"name":"Koffing","rarity":"Common"},
{"id":110,"name":"Weezing","rarity":""},
{"id":111,"name":"Rhyhorn","rarity":"Very Rare"},
{"id":112,"name":"Rhydon","rarity":""},
{"id":113,"name":"Chansey","rarity":""},
{"id":114,"name":"Tangela","rarity":"Very Rare"},
{"id":115,"name":"Kangaskhan","rarity":"Very Rare"},
{"id":116,"name":"Horsea","rarity":"Rare"},
{"id":117,"name":"Seadra","rarity":""},
{"id":118,"name":"Goldeen","rarity":"Rare"},
{"id":119,"name":"Seaking","rarity":""},
{"id":120,"name":"Staryu","rarity":"Rare"},
{"id":121,"name":"Starmie","rarity":""},
{"id":122,"name":"Mr-Mime","rarity":"Common"},
{"id":123,"name":"Scyther","rarity":"Very Rare"},
{"id":124,"name":"Jynx","rarity":"Rare"},
{"id":125,"name":"Electabuzz","rarity":"Very Rare"},
{"id":126,"name":"Magmar","rarity":"Very Rare"},
{"id":127,"name":"Pinsir","rarity":"Very Rare"},
{"id":128,"name":"Tauros","rarity":"Very Rare"},
{"id":129,"name":"Magikarp","rarity":"Super Common"},
{"id":130,"name":"Gyarados","rarity":""},
{"id":131,"name":"Lapras","rarity":"Very Rare"},
{"id":132,"name":"Ditto","rarity":"Super Rare"},
{"id":133,"name":"Eevee","rarity":"Very Rare"},
{"id":134,"name":"Vaporeon","rarity":""},
{"id":135,"name":"Jolteon","rarity":""},
{"id":136,"name":"Flareon","rarity":""},
{"id":137,"name":"Porygon","rarity":"Super Rare"},
{"id":138,"name":"Omanyte","rarity":"Super Rare"},
{"id":139,"name":"Omastar","rarity":""},
{"id":140,"name":"Kabuto","rarity":"Super Rare"},
{"id":141,"name":"Kabutops","rarity":""},
{"id":142,"name":"Aerodactyl","rarity":"Very Rare"},
{"id":143,"name":"Snorlax","rarity":"Very Rare"},
{"id":144,"name":"Articuno","rarity":""},
{"id":145,"name":"Zapdos","rarity":""},
{"id":146,"name":"Moltres","rarity":""},
{"id":147,"name":"Dratini","rarity":"Uber Rare"},
{"id":148,"name":"Dragonair","rarity":""},
{"id":149,"name":"Dragonite","rarity":""},
{"id":150,"name":"Mewtwo","rarity":""},
{"id":151,"name":"Mew","rarity":""},
{"id":152,"name":"Chikorita","rarity":"Super Rare"},
{"id":153,"name":"Bayleef","rarity":""},
{"id":154,"name":"Meganium","rarity":""},
{"id":155,"name":"Cyndaquil","rarity":"Super Rare"},
{"id":156,"name":"Quilava","rarity":""},
{"id":157,"name":"Typhlosion","rarity":""},
{"id":158,"name":"Totodile","rarity":"Super Rare"},
{"id":159,"name":"Croconaw","rarity":""},
{"id":160,"name":"Feraligatr","rarity":""},
{"id":161,"name":"Sentret","rarity":"Very Common"},
{"id":162,"name":"Furret","rarity":"Rare"},
{"id":163,"name":"Hoothoot","rarity":"Very Common"},
{"id":164,"name":"Noctowl","rarity":""},
{"id":165,"name":"Ledyba","rarity":"Common"},
{"id":166,"name":"Ledian","rarity":""},
{"id":167,"name":"Spinarak","rarity":"Rare"},
{"id":168,"name":"Ariados","rarity":""},
{"id":169,"name":"Crobat","rarity":""},
{"id":170,"name":"Chinchou","rarity":"Very Common"},
{"id":171,"name":"Lanturn","rarity":""},
{"id":172,"name":"Pichu","rarity":"Very Rare"},
{"id":173,"name":"Cleffa","rarity":"Very Rare"},
{"id":174,"name":"Igglybuff","rarity":"Very Rare"},
{"id":175,"name":"Togepi","rarity":"Very Rare"},
{"id":176,"name":"Togetic","rarity":""},
{"id":177,"name":"Natu","rarity":"Very Rare"},
{"id":178,"name":"Xatu","rarity":""},
{"id":179,"name":"Mareep","rarity":"Rare"},
{"id":180,"name":"Flaaffy","rarity":"Rare"},
{"id":181,"name":"Ampharos","rarity":""},
{"id":182,"name":"Bellossom","rarity":""},
{"id":183,"name":"Marill","rarity":""},
{"id":184,"name":"Azumarill","rarity":""},
{"id":185,"name":"Sudowoodo","rarity":"Common"},
{"id":186,"name":"Politoed","rarity":""},
{"id":187,"name":"Hoppip","rarity":"Rare"},
{"id":188,"name":"Skiploom","rarity":""},
{"id":189,"name":"Jumpluff","rarity":""},
{"id":190,"name":"Aipom","rarity":"Common"},
{"id":191,"name":"Sunkern","rarity":"Rare"},
{"id":192,"name":"Sunflora","rarity":""},
{"id":193,"name":"Yanma","rarity":"Common"},
{"id":194,"name":"Wooper","rarity":"Common"},
{"id":195,"name":"Quagsire","rarity":""},
{"id":196,"name":"Espeon","rarity":""},
{"id":197,"name":"Umbreon","rarity":""},
{"id":198,"name":"Murkrow","rarity":"Rare"},
{"id":199,"name":"Slowking","rarity":""},
{"id":200,"name":"Misdreavus","rarity":"Very Rare"},
{"id":201,"name":"Unown","rarity":"Rare"},
{"id":202,"name":"Wobbuffet","rarity":"Rare"},
{"id":203,"name":"Girafarig","rarity":"Very Rare"},
{"id":204,"name":"Pineco","rarity":"Common"},
{"id":205,"name":"Forretress","rarity":""},
{"id":206,"name":"Dunsparce","rarity":"Common"},
{"id":207,"name":"Gligar","rarity":"Very Rare"},
{"id":208,"name":"Steelix","rarity":""},
{"id":209,"name":"Snubbull","rarity":"Common"},
{"id":210,"name":"Granbull","rarity":""},
{"id":211,"name":"Qwilfish","rarity":"Very Rare"},
{"id":212,"name":"Scizor","rarity":""},
{"id":213,"name":"Shuckle","rarity":"Very Rare"},
{"id":214,"name":"Heracross","rarity":"Very Rare"},
{"id":215,"name":"Sneasel","rarity":"Very Rare"},
{"id":216,"name":"Teddiursa","rarity":"Rare"},
{"id":217,"name":"Ursaring","rarity":""},
{"id":218,"name":"Slugma","rarity":"Rare"},
{"id":219,"name":"Magcargo","rarity":""},
{"id":220,"name":"Swinub","rarity":"Common"},
{"id":221,"name":"Piloswine","rarity":""},
{"id":222,"name":"Corsola","rarity":"Rare"},
{"id":223,"name":"Remoraid","rarity":"Rare"},
{"id":224,"name":"Octillery","rarity":""},
{"id":225,"name":"Delibird","rarity":"Common"},
{"id":226,"name":"Mantine","rarity":"Common"},
{"id":227,"name":"Skarmory","rarity":"Very Rare"},
{"id":228,"name":"Houndour","rarity":"Common"},
{"id":229,"name":"Houndoom","rarity":""},
{"id":230,"name":"Kingdra","rarity":""},
{"id":231,"name":"Phanpy","rarity":"Common"},
{"id":232,"name":"Donphan","rarity":""},
{"id":233,"name":"Porygon2","rarity":""},
{"id":234,"name":"Stantler","rarity":"Very Rare"},
{"id":235,"name":"Smeargle","rarity":"Rare"},
{"id":236,"name":"Tyrogue","rarity":"Very Rare"},
{"id":237,"name":"Hitmontop","rarity":""},
{"id":238,"name":"Smoochum","rarity":"Rare"},
{"id":239,"name":"Elekid","rarity":"Rare"},
{"id":240,"name":"Magby","rarity":"Rare"},
{"id":241,"name":"Miltank","rarity":"Very Rare"},
{"id":242,"name":"Blissey","rarity":""},
{"id":243,"name":"Raikou","rarity":""},
{"id":244,"name":"Entei","rarity":""},
{"id":245,"name":"Suicune","rarity":""},
{"id":246,"name":"Larvitar","rarity":"Uber Rare"},
{"id":247,"name":"Pupitar","rarity":""},
{"id":248,"name":"Tyranitar","rarity":""},
{"id":249,"name":"Lugia","rarity":""},
{"id":250,"name":"Ho-Oh","rarity":""},
{"id":251,"name":"Celebi","rarity":""},
{"id":252,"name":"Treecko","rarity":"Super Rare"},
{"id":253,"name":"Grovyle","rarity":""},
{"id":254,"name":"Sceptile","rarity":""},
{"id":255,"name":"Torchic","rarity":"Super Rare"},
{"id":256,"name":"Combusken","rarity":""},
{"id":257,"name":"Blaziken","rarity":""},
{"id":258,"name":"Mudkip","rarity":"Super Rare"},
{"id":259,"name":"Marshtomp","rarity":""},
{"id":260,"name":"Swampert","rarity":""},
{"id":261,"name":"Poochyena","rarity":"Very Common"},
{"id":262,"name":"Mightyena","rarity":""},
{"id":263,"name":"Zigzagoon","rarity":"Very Common"},
{"id":264,"name":"Linoone","rarity":""},
{"id":265,"name":"Wurmple","rarity":"Very Common"},
{"id":266,"name":"Silcoon","rarity":"Rare"},
{"id":267,"name":"Beautifly","rarity":"Very Rare"},
{"id":268,"name":"Cascoon","rarity":"Rare"},
{"id":269,"name":"Dustox","rarity":"Very Rare"},
{"id":270,"name":"Lotad","rarity":"Common"},
{"id":271,"name":"Lombre","rarity":"Common"},
{"id":272,"name":"Ludicolo","rarity":""},
{"id":273,"name":"Seedot","rarity":"Common"},
{"id":274,"name":"Nuzleaf","rarity":"Rare"},
{"id":275,"name":"Shiftry","rarity":""},
{"id":276,"name":"Taillow","rarity":"Common"},
{"id":277,"name":"Swellow","rarity":""},
{"id":278,"name":"Wingull","rarity":"Common"},
{"id":279,"name":"Pelipper","rarity":""},
{"id":280,"name":"Ralts","rarity":"Common"},
{"id":281,"name":"Kirlia","rarity":""},
{"id":282,"name":"Gardevoir","rarity":""},
{"id":283,"name":"Surskit","rarity":"Common"},
{"id":284,"name":"Masquerain","rarity":""},
{"id":285,"name":"Shroomish","rarity":"Rare"},
{"id":286,"name":"Breloom","rarity":""},
{"id":287,"name":"Slakoth","rarity":"Common"},
{"id":288,"name":"Vigoroth","rarity":""},
{"id":289,"name":"Slaking","rarity":""},
{"id":290,"name":"Nincada","rarity":"Rare"},
{"id":291,"name":"Ninjask","rarity":""},
{"id":292,"name":"Shedinja","rarity":""},
{"id":293,"name":"Whismur","rarity":"Rare"},
{"id":294,"name":"Loudred","rarity":""},
{"id":295,"name":"Exploud","rarity":""},
{"id":296,"name":"Makuhita","rarity":"Rare"},
{"id":297,"name":"Hariyama","rarity":""},
{"id":298,"name":"Azurill","rarity":"Rare"},
{"id":299,"name":"Nosepass","rarity":"Rare"},
{"id":300,"name":"Skitty","rarity":"Rare"},
{"id":301,"name":"Delcatty","rarity":""},
{"id":302,"name":"Sableye","rarity":"Very Rare"},
{"id":303,"name":"Mawile","rarity":"Very Rare"},
{"id":304,"name":"Aron","rarity":"Rare"},
{"id":305,"name":"Lairon","rarity":""},
{"id":306,"name":"Aggron","rarity":""},
{"id":307,"name":"Meditite","rarity":"Very Rare"},
{"id":308,"name":"Medicham","rarity":""},
{"id":309,"name":"Electrike","rarity":"Rare"},
{"id":310,"name":"Manectric","rarity":""},
{"id":311,"name":"Plusle","rarity":"Rare"},
{"id":312,"name":"Minun","rarity":"Rare"},
{"id":313,"name":"Volbeat","rarity":"Rare"},
{"id":314,"name":"Illumise","rarity":"Rare"},
{"id":315,"name":"Roselia","rarity":"Rare"},
{"id":316,"name":"Gulpin","rarity":"Rare"},
{"id":317,"name":"Swalot","rarity":""},
{"id":318,"name":"Carvanha","rarity":"Rare"},
{"id":319,"name":"Sharpedo","rarity":""},
{"id":320,"name":"Wailmer","rarity":"Rare"},
{"id":321,"name":"Wailord","rarity":""},
{"id":322,"name":"Numel","rarity":"Rare"},
{"id":323,"name":"Camerupt","rarity":""},
{"id":324,"name":"Torkoal","rarity":"Very Rare"},
{"id":325,"name":"Spoink","rarity":"Common"},
{"id":326,"name":"Grumpig","rarity":""},
{"id":327,"name":"Spinda","rarity":"Common"},
{"id":328,"name":"Trapinch","rarity":"Rare"},
{"id":329,"name":"Vibrava","rarity":""},
{"id":330,"name":"Flygon","rarity":""},
{"id":331,"name":"Cacnea","rarity":"Common"},
{"id":332,"name":"Cacturne","rarity":""},
{"id":333,"name":"Swablu","rarity":"Very Rare"},
{"id":334,"name":"Altaria","rarity":""},
{"id":335,"name":"Zangoose","rarity":"Very Rare"},
{"id":336,"name":"Seviper","rarity":"Very Rare"},
{"id":337,"name":"Lunatone","rarity":"Very Rare"},
{"id":338,"name":"Solrock","rarity":"Very Rare"},
{"id":339,"name":"Barboach","rarity":"Rare"},
{"id":340,"name":"Whiscash","rarity":""},
{"id":341,"name":"Corphish","rarity":"Common"},
{"id":342,"name":"Crawdaunt","rarity":""},
{"id":343,"name":"Baltoy","rarity":"Rare"},
{"id":344,"name":"Claydol","rarity":""},
{"id":345,"name":"Lileep","rarity":"Common"},
{"id":346,"name":"Cradily","rarity":""},
{"id":347,"name":"Anorith","rarity":"Common"},
{"id":348,"name":"Armaldo","rarity":""},
{"id":349,"name":"Feebas","rarity":"Very Rare"},
{"id":350,"name":"Milotic","rarity":""},
{"id":351,"name":"Castform","rarity":"Rare"},
{"id":352,"name":"Kecleon","rarity":"Very Rare"},
{"id":353,"name":"Shuppet","rarity":"Rare"},
{"id":354,"name":"Banette","rarity":""},
{"id":355,"name":"Duskull","rarity":"Rare"},
{"id":356,"name":"Dusclops","rarity":""},
{"id":357,"name":"Tropius","rarity":"Very Rare"},
{"id":358,"name":"Chimecho","rarity":"Rare"},
{"id":359,"name":"Absol","rarity":"Very Rare"},
{"id":360,"name":"Wynaut","rarity":"Rare"},
{"id":361,"name":"Snorunt","rarity":"Common"},
{"id":362,"name":"Glalie","rarity":""},
{"id":363,"name":"Spheal","rarity":"Common"},
{"id":364,"name":"Sealeo","rarity":""},
{"id":365,"name":"Walrein","rarity":""},
{"id":366,"name":"Clamperl","rarity":"Rare"},
{"id":367,"name":"Huntail","rarity":""},
{"id":368,"name":"Gorebyss","rarity":""},
{"id":369,"name":"Relicanth","rarity":"Very Rare"},
{"id":370,"name":"Luvdisc","rarity":"Rare"},
{"id":371,"name":"Bagon","rarity":"Uber Rare"},
{"id":372,"name":"Shelgon","rarity":""},
{"id":373,"name":"Salamence","rarity":""},
{"id":374,"name":"Beldum","rarity":""},
{"id":375,"name":"Metang","rarity":""},
{"id":376,"name":"Metagross","rarity":""},
{"id":377,"name":"Regirock","rarity":"Uber Rare"},
{"id":378,"name":"Regice","rarity":"Uber Rare"},
{"id":379,"name":"Registeel","rarity":"Uber Rare"},
{"id":380,"name":"Latias","rarity":""},
{"id":381,"name":"Latios","rarity":""},
{"id":382,"name":"Kyogre","rarity":""},
{"id":383,"name":"Groudon","rarity":""},
{"id":384,"name":"Rayquaza","rarity":""},
{"id":385,"name":"Jirachi","rarity":""},
{"id":386,"name":"Deoxys-Normal","rarity":""},
{"id":387,"name":"Turtwig","rarity":"Super Rare"},
{"id":388,"name":"Grotle","rarity":""},
{"id":389,"name":"Torterra","rarity":""},
{"id":390,"name":"Chimchar","rarity":"Super Rare"},
{"id":391,"name":"Monferno","rarity":""},
{"id":392,"name":"Infernape","rarity":""},
{"id":393,"name":"Piplup","rarity":"Super Rare"},
{"id":394,"name":"Prinplup","rarity":""},
{"id":395,"name":"Empoleon","rarity":""},
{"id":396,"name":"Starly","rarity":"Very Common"},
{"id":397,"name":"Staravia","rarity":"Rare"},
{"id":398,"name":"Staraptor","rarity":""},
{"id":399,"name":"Bidoof","rarity":"Very Common"},
{"id":400,"name":"Bibarel","rarity":""},
{"id":401,"name":"Kricketot","rarity":"Common"},
{"id":402,"name":"Kricketune","rarity":""},
{"id":403,"name":"Shinx","rarity":"Rare"},
{"id":404,"name":"Luxio","rarity":""},
{"id":405,"name":"Luxray","rarity":""},
{"id":406,"name":"Budew","rarity":"Rare"},
{"id":407,"name":"Roserade","rarity":""},
{"id":408,"name":"Cranidos","rarity":"Very Rare"},
{"id":409,"name":"Rampardos","rarity":""},
{"id":410,"name":"Shieldon","rarity":"Very Rare"},
{"id":411,"name":"Bastiodon","rarity":""},
{"id":412,"name":"Burmy","rarity":"Rare"},
{"id":413,"name":"Wormadam-Plant","rarity":""},
{"id":414,"name":"Mothim","rarity":""},
{"id":415,"name":"Combee","rarity":"Rare"},
{"id":416,"name":"Vespiquen","rarity":""},
{"id":417,"name":"Pachirisu","rarity":"Very Rare"},
{"id":418,"name":"Buizel","rarity":"Very Rare"},
{"id":419,"name":"Floatzel","rarity":""},
{"id":420,"name":"Cherubi","rarity":"Common"},
{"id":421,"name":"Cherrim","rarity":""},
{"id":422,"name":"Shellos","rarity":"Rare"},
{"id":423,"name":"Gastrodon","rarity":""},
{"id":424,"name":"Ambipom","rarity":""},
{"id":425,"name":"Drifloon","rarity":"Very Rare"},
{"id":426,"name":"Drifblim","rarity":""},
{"id":427,"name":"Buneary","rarity":"Very Rare"},
{"id":428,"name":"Lopunny","rarity":""},
{"id":429,"name":"Mismagius","rarity":""},
{"id":430,"name":"Honchkrow","rarity":""},
{"id":431,"name":"Glameow","rarity":"Very Rare"},
{"id":432,"name":"Purugly","rarity":""},
{"id":433,"name":"Chingling","rarity":"Rare"},
{"id":434,"name":"Stunky","rarity":"Rare"},
{"id":435,"name":"Skuntank","rarity":""},
{"id":436,"name":"Bronzor","rarity":"Common"},
{"id":437,"name":"Bronzong","rarity":""},
{"id":438,"name":"Bonsly","rarity":"Rare"},
{"id":439,"name":"Mime-Jr","rarity":"Very Rare"},
{"id":440,"name":"Happiny","rarity":"Rare"},
{"id":441,"name":"Chatot","rarity":"Very Rare"},
{"id":442,"name":"Spiritomb","rarity":"Very Rare"},
{"id":443,"name":"Gible","rarity":""},
{"id":444,"name":"Gabite","rarity":""},
{"id":445,"name":"Garchomp","rarity":""},
{"id":446,"name":"Munchlax","rarity":"Very Rare"},
{"id":447,"name":"Riolu","rarity":"Rare"},
{"id":448,"name":"Lucario","rarity":""},
{"id":449,"name":"Hippopotas","rarity":"Very Rare"},
{"id":450,"name":"Hippowdon","rarity":""},
{"id":451,"name":"Skorupi","rarity":"Very Rare"},
{"id":452,"name":"Drapion","rarity":""},
{"id":453,"name":"Croagunk","rarity":"Rare"},
{"id":454,"name":"Toxicroak","rarity":""},
{"id":455,"name":"Carnivine","rarity":"Very Rare"},
{"id":456,"name":"Finneon","rarity":"Rare"},
{"id":457,"name":"Lumineon","rarity":""},
{"id":458,"name":"Mantyke","rarity":"Very Rare"},
{"id":459,"name":"Snover","rarity":"Very Rare"},
{"id":460,"name":"Abomasnow","rarity":""},
{"id":461,"name":"Weavile","rarity":""},
{"id":462,"name":"Magnezone","rarity":""},
{"id":463,"name":"Lickilicky","rarity":""},
{"id":464,"name":"Rhyperior","rarity":""},
{"id":465,"name":"Tangrowth","rarity":""},
{"id":466,"name":"Electivire","rarity":""},
{"id":467,"name":"Magmortar","rarity":""},
{"id":468,"name":"Togekiss","rarity":""},
{"id":469,"name":"Yanmega","rarity":""},
{"id":470,"name":"Leafeon","rarity":""},
{"id":471,"name":"Glaceon","rarity":""},
{"id":472,"name":"Gliscor","rarity":""},
{"id":473,"name":"Mamoswine","rarity":""},
{"id":474,"name":"Porygon-Z","rarity":""},
{"id":475,"name":"Gallade","rarity":""},
{"id":476,"name":"Probopass","rarity":""},
{"id":477,"name":"Dusknoir","rarity":""},
{"id":478,"name":"Froslass","rarity":""},
{"id":479,"name":"Rotom","rarity":"Very Rare"},
{"id":480,"name":"Uxie","rarity":""},
{"id":481,"name":"Mesprit","rarity":""},
{"id":482,"name":"Azelf","rarity":""},
{"id":483,"name":"Dialga","rarity":""},
{"id":484,"name":"Palkia","rarity":""},
{"id":485,"name":"Heatran","rarity":""},
{"id":486,"name":"Regigigas","rarity":""},
{"id":487,"name":"Giratina-Altered","rarity":""},
{"id":488,"name":"Cresselia","rarity":""},
{"id":489,"name":"Phione","rarity":""},
{"id":490,"name":"Manaphy","rarity":""},
{"id":491,"name":"Darkrai","rarity":""},
{"id":492,"name":"Shaymin-Land","rarity":""},
{"id":493,"name":"Arceus","rarity":""},
{"id":494,"name":"Victini","rarity":""},
{"id":495,"name":"Snivy","rarity":"Super Rare"},
{"id":496,"name":"Servine","rarity":""},
{"id":497,"name":"Serperior","rarity":""},
{"id":498,"name":"Tepig","rarity":"Super Rare"},
{"id":499,"name":"Pignite","rarity":""},
{"id":500,"name":"Emboar","rarity":""},
{"id":501,"name":"Oshawott","rarity":"Super Rare"},
{"id":502,"name":"Dewott","rarity":""},
{"id":503,"name":"Samurott","rarity":""},
{"id":504,"name":"Patrat","rarity":"Rare"},
{"id":505,"name":"Watchog","rarity":""},
{"id":506,"name":"Lillipup","rarity":"Rare"},
{"id":507,"name":"Herdier","rarity":""},
{"id":508,"name":"Stoutland","rarity":""},
{"id":509,"name":"Purrloin","rarity":"Rare"},
{"id":510,"name":"Liepard","rarity":""},
{"id":511,"name":"Pansage","rarity":"Very Rare"},
{"id":512,"name":"Simisage","rarity":""},
{"id":513,"name":"Pansear","rarity":"Very Rare"},
{"id":514,"name":"Simisear","rarity":""},
{"id":515,"name":"Panpour","rarity":"Very Rare"},
{"id":516,"name":"Simipour","rarity":""},
{"id":517,"name":"Munna","rarity":"Rare"},
{"id":518,"name":"Musharna","rarity":""},
{"id":519,"name":"Pidove","rarity":"Common"},
{"id":520,"name":"Tranquill","rarity":""},
{"id":521,"name":"Unfezant","rarity":""},
{"id":522,"name":"Blitzle","rarity":"Common"},
{"id":523,"name":"Zebstrika","rarity":""},
{"id":524,"name":"Roggenrola","rarity":"Rare"},
{"id":525,"name":"Boldore","rarity":""},
{"id":526,"name":"Gigalith","rarity":""},
{"id":527,"name":"Woobat","rarity":"Very Rare"},
{"id":528,"name":"Swoobat","rarity":""},
{"id":529,"name":"Drilbur","rarity":"Very Rare"},
{"id":530,"name":"Excadrill","rarity":""},
{"id":531,"name":"Audino","rarity":"Very Rare"},
{"id":532,"name":"Timburr","rarity":"Very Rare"},
{"id":533,"name":"Gurdurr","rarity":""},
{"id":534,"name":"Conkeldurr","rarity":""},
{"id":535,"name":"Tympole","rarity":"Rare"},
{"id":536,"name":"Palpitoad","rarity":""},
{"id":537,"name":"Seismitoad","rarity":""},
{"id":538,"name":"Throh","rarity":"Very Rare"},
{"id":539,"name":"Sawk","rarity":"Very Rare"},
{"id":540,"name":"Sewaddle","rarity":"Rare"},
{"id":541,"name":"Swadloon","rarity":""},
{"id":542,"name":"Leavanny","rarity":""},
{"id":543,"name":"Venipede","rarity":"Rare"},
{"id":544,"name":"Whirlipede","rarity":""},
{"id":545,"name":"Scolipede","rarity":""},
{"id":546,"name":"Cottonee","rarity":"Rare"},
{"id":547,"name":"Whimsicott","rarity":""},
{"id":548,"name":"Petilil","rarity":"Rare"},
{"id":549,"name":"Lilligant","rarity":""},
{"id":550,"name":"Basculin","rarity":"Very Rare"},
{"id":551,"name":"Sandile","rarity":"Rare"},
{"id":552,"name":"Krokorok","rarity":""},
{"id":553,"name":"Krookodile","rarity":""},
{"id":554,"name":"Darumaka","rarity":"Very Rare"},
{"id":555,"name":"Darmanitan-Standard","rarity":""},
{"id":556,"name":"Maractus","rarity":"Very Rare"},
{"id":557,"name":"Dwebble","rarity":"Very Rare"},
{"id":558,"name":"Crustle","rarity":""},
{"id":559,"name":"Scraggy","rarity":"Very Rare"},
{"id":560,"name":"Scrafty","rarity":""},
{"id":561,"name":"Sigilyph","rarity":"Very Rare"},
{"id":562,"name":"Yamask","rarity":"Very Rare"},
{"id":563,"name":"Cofagrigus","rarity":""},
{"id":564,"name":"Tirtouga","rarity":"Very Rare"},
{"id":565,"name":"Carracosta","rarity":""},
{"id":566,"name":"Archen","rarity":"Very Rare"},
{"id":567,"name":"Archeops","rarity":""},
{"id":568,"name":"Trubbish","rarity":"Very Rare"},
{"id":569,"name":"Garbodor","rarity":""},
{"id":570,"name":"Zorua","rarity":"Very Rare"},
{"id":571,"name":"Zoroark","rarity":""},
{"id":572,"name":"Minccino","rarity":"Rare"},
{"id":573,"name":"Cinccino","rarity":""},
{"id":574,"name":"Gothita","rarity":"Rare"},
{"id":575,"name":"Gothorita","rarity":""},
{"id":576,"name":"Gothitelle","rarity":""},
{"id":577,"name":"Solosis","rarity":"Rare"},
{"id":578,"name":"Duosion","rarity":""},
{"id":579,"name":"Reuniclus","rarity":""},
{"id":580,"name":"Ducklett","rarity":"Very Rare"},
{"id":581,"name":"Swanna","rarity":""},
{"id":582,"name":"Vanillite","rarity":"Very Rare"},
{"id":583,"name":"Vanillish","rarity":""},
{"id":584,"name":"Vanilluxe","rarity":""},
{"id":585,"name":"Deerling","rarity":"Very Rare"},
{"id":586,"name":"Sawsbuck","rarity":""},
{"id":587,"name":"Emolga","rarity":"Very Rare"},
{"id":588,"name":"Karrablast","rarity":"Very Rare"},
{"id":589,"name":"Escavalier","rarity":""},
{"id":590,"name":"Foongus","rarity":"Rare"},
{"id":591,"name":"Amoonguss","rarity":""},
{"id":592,"name":"Frillish","rarity":"Very Rare"},
{"id":593,"name":"Jellicent","rarity":""},
{"id":594,"name":"Alomomola","rarity":"Very Rare"},
{"id":595,"name":"Joltik","rarity":"Very Rare"},
{"id":596,"name":"Galvantula","rarity":""},
{"id":597,"name":"Ferroseed","rarity":"Very Rare"},
{"id":598,"name":"Ferrothorn","rarity":""},
{"id":599,"name":"Klink","rarity":"Rare"},
{"id":600,"name":"Klang","rarity":""},
{"id":601,"name":"Klinklang","rarity":""},
{"id":602,"name":"Tynamo","rarity":"Rare"},
{"id":603,"name":"Eelektrik","rarity":""},
{"id":604,"name":"Eelektross","rarity":""},
{"id":605,"name":"Elgyem","rarity":"Very Rare"},
{"id":606,"name":"Beheeyem","rarity":""},
{"id":607,"name":"Litwick","rarity":"Rare"},
{"id":608,"name":"Lampent","rarity":""},
{"id":609,"name":"Chandelure","rarity":""},
{"id":610,"name":"Axew","rarity":"Very Rare"},
{"id":611,"name":"Fraxure","rarity":""},
{"id":612,"name":"Haxorus","rarity":""},
{"id":613,"name":"Cubchoo","rarity":"Very Rare"},
{"id":614,"name":"Beartic","rarity":""},
{"id":615,"name":"Cryogonal","rarity":"Very Rare"},
{"id":616,"name":"Shelmet","rarity":"Very Rare"},
{"id":617,"name":"Accelgor","rarity":""},
{"id":618,"name":"Stunfisk","rarity":"Very Rare"},
{"id":619,"name":"Mienfoo","rarity":"Very Rare"},
{"id":620,"name":"Mienshao","rarity":""},
{"id":621,"name":"Druddigon","rarity":"Very Rare"},
{"id":622,"name":"Golett","rarity":"Very Rare"},
{"id":623,"name":"Golurk","rarity":""},
{"id":624,"name":"Pawniard","rarity":"Very Rare"},
{"id":625,"name":"Bisharp","rarity":""},
{"id":626,"name":"Bouffalant","rarity":"Very Rare"},
{"id":627,"name":"Rufflet","rarity":"Very Rare"},
{"id":628,"name":"Braviary","rarity":""},
{"id":629,"name":"Vullaby","rarity":"Very Rare"},
{"id":630,"name":"Mandibuzz","rarity":""},
{"id":631,"name":"Heatmor","rarity":"Very Rare"},
{"id":632,"name":"Durant","rarity":"Very Rare"},
{"id":633,"name":"Deino","rarity":""},
{"id":634,"name":"Zweilous","rarity":""},
{"id":635,"name":"Hydreigon","rarity":""},
{"id":636,"name":"Larvesta","rarity":"Very Rare"},
{"id":637,"name":"Volcarona","rarity":""},
{"id":638,"name":"Cobalion","rarity":""},
{"id":639,"name":"Terrakion","rarity":""},
{"id":640,"name":"Virizion","rarity":""},
{"id":641,"name":"Tornadus","rarity":""},
{"id":642,"name":"Thundurus","rarity":""},
{"id":643,"name":"Reshiram","rarity":""},
{"id":644,"name":"Zekrom","rarity":""},
{"id":645,"name":"Landorus","rarity":""},
{"id":646,"name":"Kyurem","rarity":""},
{"id":647,"name":"Keldeo","rarity":""},
{"id":648,"name":"Meloetta","rarity":""},
{"id":649,"name":"Genesect","rarity":""},
{"id":650,"name":"Chespin","rarity":"Super Rare"},
{"id":651,"name":"Quilladin","rarity":""},
{"id":652,"name":"Chesnaught","rarity":""},
{"id":653,"name":"Fennekin","rarity":"Super Rare"},
{"id":654,"name":"Braixen","rarity":""},
{"id":655,"name":"Delphox","rarity":""},
{"id":656,"name":"Froakie","rarity":"Super Rare"},
{"id":657,"name":"Frogadier","rarity":""},
{"id":658,"name":"Greninja","rarity":""},
{"id":659,"name":"Bunnelby","rarity":"Rare"},
{"id":660,"name":"Diggersby","rarity":""},
{"id":661,"name":"Fletchling","rarity":"Rare"},
{"id":662,"name":"Fletchinder","rarity":""},
{"id":663,"name":"Talonflame","rarity":""},
{"id":664,"name":"Scatterbug","rarity":"Rare"},
{"id":665,"name":"Spewpa","rarity":""},
{"id":666,"name":"Vivillon","rarity":""},
{"id":667,"name":"Litleo","rarity":"Very Rare"},
{"id":668,"name":"Pyroar","rarity":""},
{"id":669,"name":"Flabebe","rarity":"Very Rare"},
{"id":670,"name":"Floette","rarity":""},
{"id":671,"name":"Florges","rarity":""},
{"id":672,"name":"Skiddo","rarity":"Very Rare"},
{"id":673,"name":"Gogoat","rarity":""},
{"id":674,"name":"Pancham","rarity":"Very Rare"},
{"id":675,"name":"Pangoro","rarity":""},
{"id":676,"name":"Furfrou","rarity":"Very Rare"},
{"id":677,"name":"Espurr","rarity":"Very Rare"},
{"id":678,"name":"Meowstic-Male","rarity":""},
{"id":679,"name":"Honedge","rarity":"Very Rare"},
{"id":680,"name":"Doublade","rarity":""},
{"id":681,"name":"Aegislash-Shield","rarity":""},
{"id":682,"name":"Spritzee","rarity":"Very Rare"},
{"id":683,"name":"Aromatisse","rarity":""},
{"id":684,"name":"Swirlix","rarity":"Very Rare"},
{"id":685,"name":"Slurpuff","rarity":""},
{"id":686,"name":"Inkay","rarity":"Rare"},
{"id":687,"name":"Malamar","rarity":""},
{"id":688,"name":"Binacle","rarity":"Very Rare"},
{"id":689,"name":"Barbaracle","rarity":""},
{"id":690,"name":"Skrelp","rarity":"Very Rare"},
{"id":691,"name":"Dragalge","rarity":""},
{"id":692,"name":"Clauncher","rarity":"Very Rare"},
{"id":693,"name":"Clawitzer","rarity":""},
{"id":694,"name":"Helioptile","rarity":"Rare"},
{"id":695,"name":"Heliolisk","rarity":""},
{"id":696,"name":"Tyrunt","rarity":"Very Rare"},
{"id":697,"name":"Tyrantrum","rarity":""},
{"id":698,"name":"Amaura","rarity":"Very Rare"},
{"id":699,"name":"Aurorus","rarity":""},
{"id":700,"name":"Sylveon","rarity":""},
{"id":701,"name":"Hawlucha","rarity":"Very Rare"},
{"id":702,"name":"Dedenne","rarity":"Very Rare"},
{"id":703,"name":"Carbink","rarity":"Very Rare"},
{"id":704,"name":"Goomy","rarity":""},
{"id":705,"name":"Sliggoo","rarity":""},
{"id":706,"name":"Goodra","rarity":""},
{"id":707,"name":"Klefki","rarity":"Very Rare"},
{"id":708,"name":"Phantump","rarity":"Very Rare"},
{"id":709,"name":"Trevenant","rarity":""},
{"id":710,"name":"Pumpkaboo","rarity":"Very Rare"},
{"id":711,"name":"Gourgeist","rarity":""},
{"id":712,"name":"Bergmite","rarity":"Very Rare"},
{"id":713,"name":"Avalugg","rarity":""},
{"id":714,"name":"Noibat","rarity":"Rare"},
{"id":715,"name":"Noivern","rarity":""},
{"id":716,"name":"Xerneas","rarity":""},
{"id":717,"name":"Yveltal","rarity":""},
{"id":718,"name":"Zygarde","rarity":""},
{"id":719,"name":"Diancie","rarity":""},
{"id":720,"name":"Hoopa","rarity":""},
{"id":721,"name":"Volcanion","rarity":""}];
