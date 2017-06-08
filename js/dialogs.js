var titleHeight = 23;
var userMoney = null;
var selectedPokemonImage = null;

function requestFullScreen(element) {

    // Supports most browsers and their versions.
    var requestMethod = element.requestFullScreen ||
        element.webkitRequestFullScreen           ||
        element.mozRequestFullScreen              ||
        element.msRequestFullScreen;
    if (requestMethod) {
        requestMethod.call(element);
    } else if ( typeof window.ActiveXObject !== "undefined") {
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
            wscript.SendKeys("{F11}");
        }
    }
}

function dialogFullscreen() {
	requestFullScreen(document.body);
}


function ToolsInterfaceSetup() {
	var toolsInterface = new Interface();

	var onclick = function() {
		return ChangeTool(this.data);
	}

	var size = {"w":48,"h":48};
	var spacing = 0;
	if( $(window).width() > 1500 ) {
		size = {"w":96,"h":96};
		spacing = 15;
	} else if( $(window).width() > 1024 ) {
		size = {"w":96,"h":96};
		spacing = 15;
	}

	var x = 0;
	var running = 90;

}

var chatroom = 1;
var chatrooms = null;

function ChatSend(txt, isPM, withPMer) {

	if( txt.value.trim() != "" ) {
		var packet = null;
		if( isPM ) {
			packet = {"a":"message","p":{"chatroom":"1", "text":"/pm " + withPMer + " " + txt.value.trim()}};
		} else {
			packet = {"a":"message","p":{"chatroom":chatroom+"", "text":txt.value.trim()}};
		}

		socketAdmin.Send(packet, function(response) {

		});
		txt.value = "";
		setTimeout(function(){ txt.focus(); }, 50);
	}
}

function ChatIsFocus() {
	var txt = $(".chatInput");
	var curElement = document.activeElement;

	for(var i=0;i<txt.length;i++) {
		if( txt[i] == curElement ) {
			return true;
		}
	}
        
	var txt = $(".gameInput");
	for(var i=0;i<txt.length;i++) {
		if( txt[i] == curElement ) {
			return true;
		}
	}

	if( curElement.className == 'script' )
		return true;
	return false;
}


function ChatFocus() {
	var txt = $("#chatInput")[0];

	if( !chatIsShowing ) {
		toggleChat();
	}

	//only open if it is not presently the active document elementFromPoint
	//this makes it easier if we are to make the textbox display always on the page.
	if( socketAdmin.isConnected() ) {
		if( !ChatIsFocus() ) {
			txt.value = "";
			txt.focus();
			return false;
		}
	}
	return true;
}

function ChatPrivateMessage(username) {
    var txt = $("#chatInput")[0];
    txt.value = "/pm " + username + " ";
    txt.focus();
    return false;
}

function ChatPressKey(e, isPM, withPMer){
	e = e || event;

	var unicode=e.keyCode? e.keyCode : e.charCode
	if( unicode == 13 ) {
		e.preventDefault();
		if( e.target.value != "" ) {
			ChatSend(e.target, isPM, withPMer);
			return true;
		}
	}
	return false;
}


function DialogsResize() {

	var ds = $('.dialog');
	for(var i=0;i<ds.length;i++) {
		var d = $(ds[i]);
		var left = ($(window).width() - d.outerWidth())/2;
		var top = ($(window).height() - d.outerHeight())/2;
		d.css({
			left: left,
			top: top,
			position: 'absolute',
		});
	}
	dialogResizePokemon();

}

function Key(key,state) {
	keystate[key] = state;
}

function CanvasSetup() {
	ctx = ctx = $('#game')[0].getContext("2d");

	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;;

	$('#game')[0].addEventListener("mousedown", GameClick, false);
	//$('#game')[0].addEventListener("mousemove", GameMouseMove, false);


	$(document).bind('keydown',
		function(evt) {
			if( ChatIsFocus() ) {
				return true;
			} else {
				if( evt.which == 38 || evt.which == 87 ) {
					Key('up',true);
				} else if( evt.which == 40 || evt.which == 	83 ) {
					Key('down',true);
				} else if( evt.which == 37 || evt.which == 65 ) {
					Key('left',true);
				} else if( evt.which == 39 || evt.which == 68 ) {
					Key('right',true);
				} else if( evt.which == 32  ) {
					Key('space',true);
				} else if( evt.which == 84 ) {
					ChatFocus();
				}
				inputTimer = 100;
				return false;
			}
		}
	);
	$(document).bind('keyup',
		function(evt) {
			if( ChatIsFocus() ) {
				return true;
			} else {
				if( evt.which == 38 || evt.which == 87 ) {
					Key('up',false);
				} else if( evt.which == 40 || evt.which == 	83 ) {
					Key('down',false);
				} else if( evt.which == 37 || evt.which == 65 ) {
					Key('left',false);
				} else if( evt.which == 39 || evt.which == 68 ) {
					Key('right',false);
				} else if( evt.which == 32  ) {
					Key('space',false);
				}
				return false;
			}
		}
	);

	dialogGame();

}

var pm = {};

function ChatroomAppendDirectMessage(message) {
    var htmlValue = "<p class='chatline'>" + message + "</p>";
    $('#chat_1').append(htmlValue);
    $('.chatscroll')[0].scrollTop = $('.chatscroll')[0].scrollHeight;
}

function PrivateRoomMake(to, from_username) {
    var room = "";
    if( typeof pm[to + "-" + from_username] === 'undefined' ) {
        if( typeof pm[from_username + "-" + to] === 'undefined' ) {
            //make room
            room = from_username + "-" + to;

            var description = to;
            if( description == username ) {
                description = from_username;
            }

            id = "pm_" + room;
            buttons = "<i id='chatIcon' onclick='dialogPMClose(\""+id+"\")' class='fa fa-times fa-2'></i>";
            var dialog = dialogCreate(id,"PM: " + description,310,180,100,100, buttons);
            var height = parseFloat($("#" + id + "Contents").css("height").replace("px",""));
            var style = "height:"+(height-28)+"px;overflow-y:scroll;overflow-x:wrap;";
            var html = "<div class='pm' id='chat_"+room+"' style='" + style + "'></div>";
            html += "<input type='text' placeholder='Press enter to send a message.' class='chatinput' onkeyup='ChatPressKey(event,true,\""+description+"\");'>";
            dialogUpdate(id,html);

            $("#"+id).addClass("pmOuter");

            pm[room] = {"unread":0,"with":description};
            chatrooms[room] = "PM: " + description;
        } else {
            //use this key
            room = from_username + "-" + to;
        }
    } else {
        //use this key
        room = to + "-" + from_username;
    }
    return room;
}

function ChatroomsAppend(parameters) {
	var text = parameters.t;
	var room = parameters.r;
	var clan = parameters.c;
	var userid = parameters.i;
	var from_username = parameters.u;

	text = text.replace(/<(?:.|\n)*?>/gm, '');
	var htmlValue = "<p class='chatline' data-username='"+from_username+"' onclick=\"ChatPrivateMessage('"+from_username+"');\"><b>"+from_username+":</b>&nbsp;" + text + "</p>";

	var id = "";

	//Private Message Setup
	if( room == "pm" ) {
            
            var to = parameters.to;
            room = PrivateRoomMake(to, from_username);
            pm[room].unread++;
            id = "pm_" + room;
                
            /*
            var to = parameters.to;
            if( typeof pm[to + "-" + from_username] === 'undefined' ) {
                if( typeof pm[from_username + "-" + to] === 'undefined' ) {
                    //make room
                    room = from_username + "-" + to;

                    var description = to;
                    if( description == username ) {
                            description = from_username;
                    }

                    id = "pm_" + room;

                    buttons = "<i id='chatIcon' onclick='dialogPMClose(\""+id+"\")' class='fa fa-times fa-2'></i>";
                    //buttons += "<i id='chatIcon' onclick='dialogPMClose(\""+id+"\")' class='fa fa-times fa-2'></i>";
                    var dialog = dialogCreate(id,"PM: " + description,310,180,100,100, buttons);

                    var height = parseFloat($("#" + id + "Contents").css("height").replace("px",""));

                    var style = "height:"+(height-25)+"px;overflow-y:scroll;overflow-x:wrap;";

                    var html = "<div class='pm' id='chat_"+room+"' style='" + style + "'></div>";
                    html += "<input type='text' placeholder='Press enter to send a message.' class='chatinput' onkeyup='ChatPressKey(event,true,\""+description+"\");'>";
                    dialogUpdate(id,html);

                    $("#"+id).addClass("pmOuter");

                    pm[room] = {"unread":0,"with":description};
                    chatrooms[room] = "PM: " + description;
                } else {
                    //use this key
                    room = from_username + "-" + to;
                    pm[room].unread++;
                    id = "pm_" + room;
                }
            } else {
                //use this key
                room = to + "-" + from_username;
                pm[room].unread++;
                id = "pm_" + room;
            }
            */
	} else {
            if( area != null ) {
                area.ChatAdd(from_username, text);
            }
	}

	//

	$('#chat_' + room).append(htmlValue);
        for(var i=0;i<$('.chatscroll').length;i++) {
            $('.chatscroll')[i].scrollTop = $('.chatscroll')[i].scrollHeight;
        }

	if( id != "" ) {
		var pmList = $("#" + id + "Contents > .pm");
		for(var i=0;i<pmList.length;i++) {
			pmList[i].scrollTop = pmList[i].scrollHeight;
		}
	}

}

function toggleMaxChat() {
	if( chatSize == 200 ) {
		chatSize = canvasHeight - 100;
		$("#chatMaximize").addClass("fa-caret-square-o-down");
		$("#chatMaximize").removeClass("fa-caret-square-o-up");
	} else {
		chatSize = 200;
		$("#chatMaximize").addClass("fa-caret-square-o-up");
		$("#chatMaximize").removeClass("fa-caret-square-o-down");
	}
	redrawChat();
}

function toggleChat() {
	chatIsShowing = !chatIsShowing;
	redrawChat();

}

function redrawChat() {
	if( chatIsShowing ) {
		$('#chat').css("top", canvasHeight-chatSize-4);
		$("#chat").css("height", chatSize+"px");
		$('#chat').css("left", 5);

		$("#chatIcon").removeClass('fa-caret-up');
		$("#chatIcon").addClass('fa-caret-down');

		$(".chatContents").css("display","block");
	} else {
		$('#chat').css("top", canvasHeight-titleHeight-6);
		$('#chat').css("height",titleHeight + "px");
		$('#chat').css("left", 5);

		$("#chatIcon").removeClass('fa-caret-down');
		$("#chatIcon").addClass('fa-caret-up');

		$(".chatContents").css("display","none");
	}

	$(".chatscroll").css("height", (chatSize-49)+"px");

}

function ChatroomsSelect(roomId, obj) {
    chatroom = roomId;
    
    $(".dialogRoom").removeClass("roomSelected");
    $(obj).addClass("roomSelected");

    $(".chatscroll").css("display","none");
    $("#chat_" + chatroom).css("display","block");
}


function DerriveScale() {
	if( $('#game').outerWidth() > 1900 ) {
		//SetScale(1);
	} else {
		if( $('#game').outerWidth() > 1024 ) {
			//SetScale(1);
		}  else {

		}
	}
}


function WindowResize() {
	DialogsResize();
	var headerHeight = 0;
	var absX = false;
	var absY = false;

	var w = window.innerWidth
	|| document.documentElement.clientWidth
	|| document.body.clientWidth;

	var h = window.innerHeight
	|| document.documentElement.clientHeight
	|| document.body.clientHeight;

	h -= headerHeight;

	$('#game').css("width",w + "px");
	$('#game')[0].width = w;
	absX = true;

	$('#game').css("height",h + "px");
	$('#game')[0].height = h;
	absY = true;

	$('#game').css({
		left: 0,
		top: headerHeight
	});

	//add in the chat column
	if( w < 700 ) {
		//will eventually set mobileMode
	} else {
		//desktop, Show chat bar
		$('#game').css({ width: w });

	}

	canvasWidth = $('#game').outerWidth();
	canvasHeight = $('#game').outerHeight();
	$('#game')[0].width = $('#game').outerWidth();
	$('#game')[0].height = $('#game').outerHeight();

	redrawChat();

}

function DisplayEmoji(style) {
	var packet  = {"a":"emote","p":{"style":style}};
	socketAdmin.Send(packet, function(response) {

	});
}

//Draw the Emoji Select Interface.
function dialogEmojiToggle() {
	var data = null;
	var button = null;

	//remove the interface if it is displaying
	if( interfaceEmoji != null ) {
		interfaces.splice(interfaces.indexOf(interfaceEmoji),1);
		interfaceEmoji = null;
		return true;
	}

	//create the emoji select dialog.
	interfaceEmoji = new Interface();

	var y = -46;
	for(var i=0;i<emotes.length;i++) {
		y -= 38;
		var emote = emotes[i];
		data = {"text": null,"image":null,"definition":emote,"x":-45,"y":y,"ax":1,"ay":1,"w":32,"h":32,"data":emote,"type":"emoji"};
		button = new Element(data,   function() {
				DisplayEmoji(this.data);
				interfaces.splice(interfaces.indexOf(interfaceEmoji),1);
				interfaceEmoji = null;
				return true;
			});
		interfaceEmoji.Add("emoji",button);
	}

	interfaces.push(interfaceEmoji);
	return true;
}

function dialogGame() {
	var data = null;
	var button = null;

	$(".message").css("display","none");
	$(".chatroom").css("display","block");

	//create the game interface
	interfaceGame = new Interface();

	var iconWidth = 32;

	// Draw emotes
	data = {"text": null,"image":null,"definition":"emoteBlank","x":-45,"y":-45,"ax":1,"ay":1,"w":32,"h":32,"data":"","type":"emoji"};
	button = new Element(data,  dialogEmojiToggle);
	interfaceGame.Add("emoji",button);

	// Draw these top right background
	data = {"text": null,"image":"/play/images/top_right_bg.png","definition":"","x":-130,"y":0,"ax":1,"ay":0,"w":180,"h":406,"data":"","type":"menu"};
	iconBackpack = new Element(data, null);
	interfaceGame.Add("top_right_bg",iconBackpack);

	data = {"text": "$","image":null,"definition":"","x":-110,"y":18,"ax":1,"ay":0,"w":180,"h":50,"data":"","type":"moneytext"};
	userMoney = new Element(data, null);
	interfaceGame.Add("userMoney",userMoney);

	data = {"text": null,"image":"/play/images/exit32.png","definition":"","x":-38,"y":10,"ax":1,"ay":0,"w":32,"h":32,"data":"","type":"menu"};
	iconBackpack = new Element(data, gameLogout);
	interfaceGame.Add("logout",iconBackpack);
        
	data = {"text": null,"image":"/play/images/backpack32.png","definition":"","x":-95,"y":-45,"ax":1,"ay":1,"w":32,"h":32,"data":"","type":"menu"};
	iconBackpack = new Element(data, dialogBackpack);
	interfaceGame.Add("backpack",iconBackpack);

	data = {"text": null,"image":"/play/images/pokedex32.png","definition":"","x":-145,"y":-45,"ax":1,"ay":1,"w":32,"h":32,"data":"","type":"menu"};
	iconPokedex = new Element(data, dialogPokedex);
	interfaceGame.Add("pokedex",iconPokedex);

	data = {"text": null,"image":"/play/images/map32.png","definition":"","x":-195,"y":-45,"ax":1,"ay":1,"w":32,"h":32,"data":"","type":"menu"};
	iconMap = new Element(data, dialogMap);
	interfaceGame.Add("map",iconMap);

	data = {"text": null,"image":"/play/images/music32.png","definition":"","x":-245,"y":-45,"ax":1,"ay":1,"w":32,"h":32,"data":"","type":"menu"};
	iconMusic = new Element(data, dialogMusic);
	interfaceGame.Add("map",iconMusic);

	data = {"text": null,"image":"/play/images/iconFriends.png","definition":"","x":-295,"y":-45,"ax":1,"ay":1,"w":32,"h":32,"data":"","type":"menu"};
	iconFriends = new Element(data, dialogFriends);
	interfaceGame.Add("map",iconFriends);


	iconPokemon = [];
	for(var i=0;i<6;i++) {
            data = {"text": null,"image":"/play/images/lineup_background.png","definition":"","x":5,"y":8,"ax":0,"ay":0,"w":207,"h":70,"data":{"position":(i+1)},"type":"menu"};
            var icon = new Element(data, null);
            interfaceGame.Add("p" + (i+1),icon);
            iconPokemon.push(icon);
	}

	interfaces.push(interfaceGame);
	dialogResizePokemon();
}

function gameLogout() {
    window.location = '/logout/';
}

function dialogResizePokemon() {
	var height = 70;
	var spacer = 5;
	var size =  iconPokemon.length * (height + spacer);

	for(var i=0;i<iconPokemon.length;i++) {
            var icon = iconPokemon[i];
            icon.position.y = 10+((height+spacer) * i) + spacer/2;
	}

}

var dialogsByTag = {};
function dialogCreate(id, title, width, height, x, y, buttons) {
	var div = document.createElement("div");
	div.setAttribute("id", id);
	$(div).css("position","absolute");
	$(div).css("left",x + "px");
	$(div).css("top",y + "px");
	$(div).addClass('dialogPanel');
	$(div).addClass('dialogPanel');

	document.body.appendChild(div);

	dialogsByTag[id] = div;

	if( buttons == "" || buttons == null ) {
		buttons = "<i id='chatIcon' onclick='dialogClose(\""+id+"\")' class='fa fa-times fa-2'></i>";
	}

	div.innerHTML = "<div class='dialogTitle'><div class='dialogTitleLabel'>"+title+"</div><div class='dialogToggle'>"+buttons+"</div></div><div id='"+id+"Contents'></div>";
	$( "#" + id ).draggable({  handle: ".dialogTitleLabel", containment: "#game", scroll: false });


	$("#" + id + "Contents").css("background-color", "#333");
	dialogResize(id, width, height);

	return div;
}

function dialogPokemon(element) {
	console.log("Click on Pokemon: " + element.data.position);

	var pos = element.data.position;
	var position = parseInt(pos,10)-1;
	var pokemon = pokemonTeam[position];
	if( pokemon == null ) {
		return true;
	}

	var title = "" + pos + " - " + pokemon.Name().toUpperCase() + " Lv." + pokemon.Level();

	var id = "p" + pos;
	var dialog = dialogsByTag[id];
	if( !dialog ) {
		dialog = dialogCreate(id,title,180,137,60+ 190 * (pos-1),100, "");
	} else {
		dialogClose(id);
		return true;
	}
	$(dialog).css("opacity",1);
	//dialogUpdate(id, pokemon.infoHTML());
	return true;
}


function dialogFriends() {
    var id = "friends";
    
    var title = "Friends";
    var dialog = dialogsByTag[id];
    if( !dialog ) {
        dialog = dialogCreate(id,title,320,320,canvasWidth/2-160,canvasHeight/2-200, "");
    } else {
        dialogClose(id);
        return true;
    }
    $(dialog).css("opacity",1);
    var html = "";
    html += '<div class="text-center"><input id="txtFriend" class="gameInput" style="margin: 0px 5px;" placeholder="Friends Username"><button class="button" onclick="friendRequest()">Request</button></div>';
    
    
    html += "<div style='margin-top: 5px;height: 237px;overflow-y:scroll;'>";
    html += "<div id='friendsRequestsBox'>";
    html += "<p>Friend Requests <span id='friendsRequestCount'></span></p>";
    html += "<div id='friendsRequests'></div>";
    html += "</div>";
    
    html += "<p>Online Friends <span id='friendsOnlineCount'></span></p>";
    html += "<div id='friendsOnline'></div>";
    
    html += "<p>Offline Friends <span id='friendsOfflineCount'></span></p>";
    html += "<div id='friendsOffline'></div>";
    html += "</div>";
    
    dialogUpdate(id, html);
    friendsUpdatePanel();
    return true;
}

function friendRequest() {
    var name = $("#txtFriend").val();
    var packet = {"a":"friend_request","p":{"name":name}};
    socketAdmin.Send(packet, function(response) {
        if( response.result == 1 ) {
            alert("Friend Request Sent");
        } else {
            alert("Either the user could not be found or the request has already been sent.");
        }
    });
}

function friendsUpdatePanel() {
    //panel is not yet open
    if( $("#friendsRequests").length == 0 )
        return;
    
    var htmlRequests = "";
    var htmlOnline = "";
    var htmlOffline = "";
    var online = 0;
    var offline = 0;
    for(var i=0;i<friends.length;i++) {
        var friend = friends[i];
        if( friend.area == "" ) {
            htmlOffline += friendHTML(friend, false);
            offline++;
        } else {
            htmlOnline += friendHTML(friend, false);
            online++;
        }
    }
    
    $("#friendsOnline").html(htmlOnline);
    $("#friendsOffline").html(htmlOffline);
    
    for(var i=0;i<friendRequests.length;i++) {
        var friend = friendRequests[i];
        htmlRequests += friendHTML(friend, true);
    }
    $("#friendsRequestCount").html(" x" +friendRequests.length);
    $("#friendsOnlineCount").html(" x" +online);
    $("#friendsOfflineCount").html(" x" +offline);
    
    $("#friendsRequests").html(htmlRequests);
    if( htmlRequests == "" ) {
        $("#friendsRequestsBox").css("display","none");
    } else {
        $("#friendsRequestsBox").css("display","block");
    }
}
function friendHTML(friend, isRequest) {
    var html = "<div class='friendEntry'>";
    if( friend.area == "" ) {
        html += "<div class='circle circleRed'></div>";
    } else {
        html += "<div class='circle circleGreen'></div>";
    }
    html += friend.name;
    
    html += "<div class='pull-right'><img style='cursor:pointer;' src='/play/images/cross.png' onclick='friendRemove("+friend.id+")'/>&nbsp;</div>";
    if( isRequest ) {
       html += "<div class='pull-right'><img style='cursor:pointer;' src='/play/images/tick.png' onclick='friendConfirm("+friend.id+")'/>&nbsp;</div>";
    }
    
    
    if( friend.area != "" && !isRequest ) {
        html += "<div class='pull-right'><img style='cursor:pointer;' src='/play/images/balloon-white.png' onclick='PrivateRoomMake(username, \""+friend.name+"\")'/>&nbsp;</div>";
        
        //PrivateRoomMake(to, from_username)
        
        html += "<div class='pull-right' style='display:inline-block;text-align:right;'>"+friend.area+"&nbsp;</div>";
    }
    
    html += "</div>";
    return html;
}

function friendsRemoveServer(parameters) {
    for(var i=0;i<friends.length;i++) {
        var friend = friends[i];
        if( friend.id == parameters.pk ) {
            friends.splice(i,1);
            friendsUpdatePanel();
            break;
        }
    }
    for(var i=0;i<friendRequests.length;i++) {
            var friend = friendRequests[i];
            if( friend.id == parameters.pk ) {
                friendRequests.splice(i,1);
                friendsUpdatePanel();
                break;
            }
        }
}

function friendConfirm(friendId) {
    var packet = {"a":"friend_confirm","p":{"pk":friendId}};
	socketAdmin.Send(packet, function(response) {
            if( response.result == 1 ) {
                for(var i=0;i<friendRequests.length;i++) {
                    var friend = friendRequests[i];
                    if( friend.id == friendId ) {
                        friendRequests.splice(i,1);
                        friendsUpdatePanel();
                        return;
                    }
                }
            }
	});
}

function friendRemove(friendId) {
    var r = confirm("Are you sure you want to remove this friend?");
    if (r == true) {
	var packet = {"a":"friend_remove","p":{"pk":friendId}};
	socketAdmin.Send(packet, function(response) {
            if( response.result == 1 ) {

            }
	});
    } else {
        
    }
}

function friendsUpdate(parameters) {
    
    for(var i=0;i<parameters.friends.length;i++) {
        var f = parameters.friends[i];
        friendUpdate(f);
    }
    for(var i=0;i<parameters.requests.length;i++) {
        var f = parameters.requests[i];
        friendRequestUpdate(f);
    }
    
    //update the dialog if its open
    friendsUpdatePanel();
}

function friendRequestUpdate(f) {
    for(var i=0;i<friendRequests.length;i++) {
        var friend = friendRequests[i];
        if( friend.id == f.id ) {
            return;
        }
    }
    //add
    friendRequests.push(f);
}

function friendUpdate(f) {
    var bFound = false;
    for(var i=0;i<friends.length;i++) {
        var friend = friends[i];
        if( friend.id == f.id ) {
            bFound = true;
            
            friend.area = f.area;
            //ammend in place
            return;
        }
    }
    if( !bFound ) {
        //add
        friends.push(f);
    }
}

function dialogFainted() {
    var id = "fainted";
    var title = "You have fainted.";
    var dialog = dialogsByTag[id];
    if( !dialog ) {
        dialog = dialogCreate(id,title,320,320,canvasWidth/2-160,canvasHeight/2-200, "");
    } else {
        dialogClose(id);
        return true;
    }
    $(dialog).css("opacity",1);
    var html = "";
    
    html += "<p>You have been attacked by a wild Pokemon and fainted.</p>";
    
    html += "<p>When you explore the Pokemon Rise world you will need to call out your Pokemon from their Pokeballs to assist you when encountering wild Pokemon.</p>";
    
    html += "<p>Click the Pokeball next to your Pokemon to call it out.</p>";
    
    dialogUpdate(id, html);
    return true;
}


function dialogGettingStarted() {
    var id = "gettingStarted";
    var title = "How to Play Pokemon Rise";
    var dialog = dialogsByTag[id];
    if( !dialog ) {
        dialog = dialogCreate(id,title,320,320,canvasWidth/2-160,canvasHeight/2-200, "");
    } else {
        dialogClose(id);
        return true;
    }
    $(dialog).css("opacity",1);
    var html = "";
    
    html += "<p>Warning: Pokemon Rise is not like other Pokemon Games. Follow the tips below to learn how to play:</p>";
    
    html += "<ul>";
    html += "<li>You can reset your posiiton by typing /faint</li>";
    html += "<li>Click the Pokeball next to your Pokemon to send it out and return it.</li>";
    html += "<li>Your Pokemon will attack automatically when in range of a Wild Pokemon.</li>";
    html += "<li>You can chose which attack your Pokemon will use.</li>";
    html += "<li>If a wild Pokemon attacks you (the trainer), you will faint and wake inside the last Pokemon Center you visited.</li>";
    html += "<li>You can buy Pokeballs at the Pokemart.</li>";
    html += "<li>You can heal your Pokemon at the Pokemon Center.</li>";
    html += "<li>You can make money by selling Pokemon you have caught at the Pokemon Lab.</li>";
    html += "</ul>";
    
    dialogUpdate(id, html);
    return true;
}



function dialogUpdate(id, html) {
	$("#"+id+"Contents").html(html);
}
function dialogResize(id, width, height) {
	$("#" + id).css("width",width + "px");
	$("#" + id).css("height",height + "px");

	$("#" + id + "Contents").css("height", height - titleHeight);

}
function dialogBackpack() {
	console.log("Click on Backpack.");

	var title = "BACKPACK";
	var id = "backpack";
	var dialog = dialogsByTag[id];
	if( !dialog ) {
            dialog = dialogCreate(id,title,320,300,canvasWidth/2-320/2,300, "");
	} else {
            dialogClose(id);
            return true;
	}

	dialogUpdateBackpack();

	return true;
}
function dialogUpdateBackpack() {
	var html = "";

	for(var i=0;i<items.length;i++) {
            var p = items[i];

            var selClass = "";
            if( selectedItem == p.item_id ) {
                selClass = ' itemSelected';
            }

            html += "<div class='itemEntry "+selClass+"' id='item"+p.item_id+"' onclick='itemSelect("+p.item_id+",\""+p.image+"\");'>";
            html += "<img src='/play/images/items/"+p.image+"'/><br/>";
            html += p.name;
            html += "<br/>";
            html += "<sup>x" + p.quantity + "</sup>";
            html += "</div>";
	}

	dialogUpdate("backpack", html);
}

function itemById(id) {
	for(var i=0;i<items.length;i++) {
		var p = items[i];
		if(  p.item_id == id ) {
			return p;
		}
	}
	return null;
}


function itemSelect(item_id, item_image) {

	if( selectedItem != null ) {
		setCursor("pointer");
		$("#item"+selectedItem).removeClass('itemSelected');
		selectedItem = null;

	} else {
		setCursor("/play/images/items/" + item_image);
		selectedItem = item_id;

		$("#item"+item_id).addClass('itemSelected');
	}

	//cursor:url(http://www.javascriptkit.com/dhtmltutors/cursor-hand.gif), auto;
}

function setCursor(val) {
	if( val == "pointer" ) {
		$("#game").css("cursor",val);
	} else {
		$("#game").css("cursor", "url('"+val+"'), auto");
	}
}

function dialogNPCEditor(npcEntity) {
	var id = "npcDeveloper" + npcEntity.id;

	if( dialogExists(id) ) {
		dialogShow(id);
	} else {
		var buttons = "<i id='chatIcon' onclick='dialogHide(\""+id+"\")' class='fa fa-times fa-2'></i>";
		var dialog = dialogCreate(id, "NPC Script", 500, 400, 10, 10, buttons);
		var html =  "<br/><span style='color:white;'><center>Requesting Script</center></span>";
		dialogUpdate(id, html);
	}

	var packet = {"a":"npcscript","p":{"npc":npcEntity.id}};
	socketAdmin.Send(packet, function(response) {
		if( response.result == 1 ) {
			var elm = "script" + npcEntity.id;
			html = "<textarea class='script' id='"+elm+"' style='width:100%;height:350px;'></textarea>";
			html += "<div class='game-button' style='width: 486px;' onclick='updateNPCScript(\""+npcEntity.id+"\")'>Save Changes</div>";

			dialogUpdate(id, html);
			$("#" + elm).val(response.script);
		}
	});

	return true;
}

function updateNPCScript(id) {
	var elm = "script" + id;
	var script = $("#" + elm).val();
	var packet = {"a":"npcupdate","p":{"npc":id,"script":script}};
	socketAdmin.Send(packet, function(response) {
		if( response.result == 1 ) {

		}
	});
}

function dialogMusic() {
	var id = "music";

	if( dialogExists(id) ) {
		dialogShow(id);
		return;
	}

	var html = '<iframe width="200" height="113" src="https://www.youtube.com/embed/videoseries?list=PLI42kQlAcV1afrZn46N3jOQ76-UUlt1Vv" frameborder="0" allowfullscreen></iframe>';
	var buttons = "<i id='chatIcon' onclick='dialogHide(\""+id+"\")' class='fa fa-times fa-2'></i>";


	var dialog = dialogCreate(id, "POKEMON PARK PLAYLIST", 200, 140, canvasWidth - 220,canvasHeight - 200, buttons);
	dialogUpdate(id, html);
	return true;
}

function dialogPokedex() {
	console.log("Click on Pokedex.");

	var title = "POKEDEX";
	var id = "pokedex";
	var dialog = dialogsByTag[id];
	if( !dialog ) {
		dialog = dialogCreate(id,title,320,300,canvasWidth/2-320/2,100, "");
	} else {
		dialogClose(id);
		return true;
	}

	dialogUpdate(id, "<br/><span style='color:white;'><center>Requesting Pokedex</center></span>");

	var packet = {"a":"pokedex","p":{}};
	var ent = this;
	socketAdmin.Send(packet, function(response) {
		if( response.result == 1 ) {
			dialogPokedexUpdate(id, response.pokedex);
		}
	});

	//dialogUpdateBackpack();

	return true;
}

function pokelabCancel() {
    dialogHide("pokelab");
    scriptPop();
}

function pokelabConfirm() {
    var teamRay = [];
    var team = $(".labEntrySelected");
    for(var i=0;i<team.length;i++) {
        var poke = team[i];
        var pk = $(poke).data("pk");
        
        if( pk == null )
            pk = 0;
        if( typeof pk === 'undefined' )
            pk = 0;
        
        teamRay.push(pk);
    }
    
    var packet = {"a":"lab","p":{"token":script[0].token,"lab":teamRay}};
    socketAdmin.Send(packet, function(response) {
        if( response.result == 1 ) {
            money = response.money;
            pokelabCancel();
        } else {
            alert(response.error);
        }
    });
}


function dialogLab(team, storage) {
    console.log("Pokemon Lab Launch.");
    
    var title = "Pokemon Lab";
    var id = "pokelab";
    var dialog = dialogsByTag[id];
    if( !dialog ) {
        var buttons = "<i id='chatIcon' onclick='pokelabCancel();' class='fa fa-times fa-2'></i>";
        dialog = dialogCreate(id,title,320,375,canvasWidth/2-320/2,100, buttons);
    } else {
        dialogShow(id);
    }
    
    var html = "";
    html += "<strong>Team:</strong>";
    html += "<div id='pokeTeam' style=''>";
    for(var i=1;i<7;i++) {
        var p = team[i+""];
        if( p == null ) {
            html += "<div class='storageEntry storageEmpty' data-position='"+i+"'>";
            html += "<br/>";
            html += "<sup>"+i+"</sup><br/>";
            html += "</div>";
        } else {
            var pid = "000" + p.pokemon_id;
            var cls = "";
            pid = pid.substring(pid.length-3,pid.length);
            var gender = p.gender == "M" ? "male" : "female";

            html += "<div class='labEntry storageFilled' data-position='"+i+"'  data-pk='"+p.pk+"' data-pid='"+pid+"' data-gender='"+gender+"' data-level='"+p.level+"' data-market_price='"+p.market_price+"'>";
            html += "<img  class='' src='/play/images/icons/"+pid+".png'/><br/>";
            html += "<sup>Lv."+p.level+"</sup> <img src='/play/images/"+gender+".png' style=''><br/>";
            html += "<sup>$"+parseFloat(p.market_price).toLocaleString('en')+"</sup>";
            html += "</div>";
        }
    }
    
    html += "</div>";
    html += "<strong>Storage:</strong><br/>";
    html += "<div id='pokeBox' style='height: 148px;overflow-y:scroll;'>";
    
    for(var i=0;i<storage.length;i++) {
        var p = storage[i];
        
        var pid = "000" + p.pokemon_id;
        var cls = "";
        pid = pid.substring(pid.length-3,pid.length);
        var gender = p.gender == "M" ? "male" : "female";

        html += "<div class='labEntry storageFilled' data-position='7' data-pk='"+p.pk+"' data-pid='"+pid+"' data-gender='"+gender+"' data-level='"+p.level+"' data-market_price='"+p.market_price+"'>";
        html += "<img class='' src='/play/images/icons/"+pid+".png'/><br/>";
        html += "<sup>Lv."+p.level+"</sup> <img  src='/play/images/"+gender+".png' style=''><br/>";
        html += "<sup>$"+parseFloat(p.market_price).toLocaleString('en')+"</sup>";
        
        html += "</div>";
    }
    html += "</div>";
    html += "<div id='pokemartPurchase' style='height: 28px;'>";
    html += "<span class='pull-left' id='labTotal'>$0</span>";
    html += "<span class='pull-right'><button class='button ' onclick='pokelabCancel();'>Cancel</button>&nbsp;<button class='button' onclick='pokelabConfirm();'>Confirm</button></span>";
    html += "</div>";
    
    dialogUpdate(id, html);
    
    $(".labEntry").click(function(e) {
        $(this).toggleClass("labEntrySelected");
        
        var selection = $(".labEntrySelected");
        var total = 0;
        for(var i=0;i<selection.length;i++) {
            total += parseFloat($(selection[i]).data("market_price"));
        }
        $("#labTotal").html("$" + total.toLocaleString('en'));
    })
    
    return true;
}


function dialogStorage(team, storage) {
    console.log("Pokemon Storage Launch.");

    var title = "Pokemon Storage";
    var id = "pokestorage";
    var dialog = dialogsByTag[id];
    if( !dialog ) {
        var buttons = "<i id='chatIcon' onclick='pokestorageCancel();' class='fa fa-times fa-2'></i>";
        dialog = dialogCreate(id,title,320,375,canvasWidth/2-320/2,100, buttons);
    } else {
        dialogShow(id);
    }


    var html = "";
    html += "<strong>Team:</strong>";
    html += "<div id='pokeTeam' style=''>";
    for(var i=1;i<7;i++) {
        var p = team[i+""];
        if( p == null ) {
            
            html += "<div class='storageEntry storageEmpty' data-position='"+i+"'>";
            html += "<br/>";
            html += "<sup>"+i+"</sup><br/>";
            html += "</div>";
        } else {
            var pid = "000" + p.pokemon_id;
            var cls = "";
            pid = pid.substring(pid.length-3,pid.length);
            var gender = p.gender == "M" ? "male" : "female";

            html += "<div class='storageEntry storageFilled' data-position='"+i+"'  data-pk='"+p.pk+"' data-pid='"+pid+"' data-gender='"+gender+"' data-level='"+p.level+"'>";
            html += "<img  class='storagePokemon' src='/play/images/icons/"+pid+".png'/><br/>";
            html += "<sup>Lv."+p.level+"</sup> <img src='/play/images/"+gender+".png' style=''><br/>";
            html += "</div>";
        }
    }
    
    html += "</div>";
    html += "<strong>Storage:</strong><br/>";
    html += "<div id='pokeBox' style='height: 180px;overflow-y:scroll;'>";
    
    html += "<div class='storageEntry storageEmpty' data-position='7'>";
    html += "<br/>";
    html += "<sup>Store</sup><br/>";
    html += "</div>";
    
    
    for(var i=0;i<storage.length;i++) {
        var p = storage[i];
        
        var pid = "000" + p.pokemon_id;
        var cls = "";
        pid = pid.substring(pid.length-3,pid.length);
        var gender = p.gender == "M" ? "male" : "female";

        html += "<div class='storageEntry storageFilled' data-position='7' data-pk='"+p.pk+"' data-pid='"+pid+"' data-gender='"+gender+"' data-level='"+p.level+"'>";
        html += "<img class='storagePokemon' src='/play/images/icons/"+pid+".png'/><br/>";
        html += "<sup>Lv."+p.level+"</sup> <img  src='/play/images/"+gender+".png' style='margin:5px;'><br/>";
        html += "</div>";
    }
    html += "</div>";
    html += "<div id='pokemartPurchase' style='height: 28px;'>";
    html += "<span class='pull-right'><button class='button ' onclick='pokestorageCancel();'>Cancel</button>&nbsp;<button class='button' onclick='pokestorageConfirm();'>Confirm</button></span>";
    html += "</div>";
    
    dialogUpdate(id, html);

    $( ".storagePokemon" ).draggable({
        containment: '#pokestorage',
        helper: 'clone',
        cursor: 'move',
        stack: ".draggable",
        start: function( event, ui ) {
            selectedPokemonImage = event.target;
        }
    });
        
    $('.storageEntry').droppable( {
        drop: pokestorageDrop
    } );
    return true;
}

function pokestorageDrop( event, ui ) {
    var drop = event.target;
    var img = selectedPokemonImage;
    var drag = img.parentElement;
    
    var dragPk = $(drag).data("pk");
    var dragPosition = $(drag).data("position");
    var dragPid = $(drag).data("pid");
    var dragGender = $(drag).data("gender");
    var dragLevel = $(drag).data("level");
    
    var dropPk = $(drop).data("pk");
    var dropPosition = $(drop).data("position");
    var dropPid = $(drop).data("pid");
    var dropGender = $(drop).data("gender");
    var dropLevel = $(drop).data("level");
    
    if( typeof dropPk === 'undefined' && typeof dragPk !== 'undefined' ) {
        //drag pokemon to drop blank
        pokestorageSetBlank(drag);
        pokestorageSet(drop, dragPk, dragPid, dragGender, dragLevel);
    } else if( typeof dropPk !== 'undefined' && typeof dragPk === 'undefined' ) {
        //should never happen
    } else if( typeof dropPk !== 'undefined' && typeof dragPk !== 'undefined' ) {
        //drag pokemon to drop pokemon
        pokestorageSet(drag, dropPk, dropPid, dropGender, dropLevel);
        pokestorageSet(drop, dragPk, dragPid, dragGender, dragLevel);
    }
    
    $(img).remove();
    
    $( ".storagePokemon" ).draggable({
        containment: '#pokestorage',
        stack: ".draggable",
        helper: 'clone',
        cursor: 'move',
        start: function( event, ui ) {
            selectedPokemonImage = event.target;
        }
    });
    $('.storageEntry').droppable( {
        drop: pokestorageDrop
    } );
}

function pokestorageSet(target, pk, pid, gender, level) {
    var html = "";
    var position = $(target).data("position");
    if( position == "7" ) {
        var targetCurrentPk = $(target).data("pk");
        if( typeof targetCurrentPk === 'undefined' ) {
            //add the element
            //
            html += "<div class='storageEntry storageFilled' data-position='7' data-pk='"+pk+"' data-pid='"+pid+"' data-gender='"+gender+"' data-level='"+level+"'>";
            html += "<img class='storagePokemon' src='/play/images/icons/"+pid+".png'/><br/>";
            html += "<sup>Lv."+level+"</sup> <img  src='/play/images/"+gender+".png' style='margin:5px;'><br/>";
            html += "</div>";
            $(target.parentElement).append(html);
            return;
            
        } else {
            html += "<img class='storagePokemon' src='/play/images/icons/"+pid+".png'/><br/>";
            html += "<sup>Lv."+level+"</sup> <img src='/play/images/"+gender+".png' style='margin:5px;'><br/>";
            $(target).html(html);
        }
    } else {
        html += "<img class='storagePokemon' src='/play/images/icons/"+pid+".png'/><br/>";
        html += "<sup>Lv."+level+"</sup> <img src='/play/images/"+gender+".png' style='margin:5px;'><br/>";
        $(target).html(html);
    }
    
    target.setAttribute("data-pk", pk);
    target.setAttribute("data-pid", pid);
    target.setAttribute("data-level", level);
    target.setAttribute("data-gender", gender);
    
    $(target).data("pk", pk);
    $(target).data("pid", pid);
    $(target).data("level", level);
    $(target).data("gender", gender);
    
    $(target).removeClass("storageEmpty");
    $(target).addClass("storageFilled");
}

function pokestorageSetBlank(target) {
    target.removeAttribute("data-pk");
    target.removeAttribute("data-pid");
    target.removeAttribute("data-level");
    target.removeAttribute("data-gender");
    
    $(target).removeData("pk");
    $(target).removeData("pid");
    $(target).removeData("level");
    $(target).removeData("gender");
    
    var position = $(target).data("position");
   
    var html = "";
    if( position == "7" ) {
        //remove element
        $(target).remove();
        return;
        
        
        //html += "<br/>";
        //html += "<sup>Store</sup><br/>";
    } else {
        html += "<br/>";
        html += "<sup>"+position+"</sup><br/>";
    }
    $(target).html(html);
    
    $(target).removeClass("storageFilled");
    $(target).addClass("storageEmpty");
    
    
}

function pokestorageCancel() {
    dialogHide("pokestorage");
    scriptPop();
}
function pokestorageConfirm() {
    var teamRay = [];
    var team = $("#pokeTeam")[0];
    for(var i=0;i<team.childNodes.length;i++) {
        var poke = team.childNodes[i];
        var position = $(poke).data("position");
        var pk = $(poke).data("pk");
        if( pk == null )
            pk = 0;
        if( typeof pk === 'undefined' )
            pk = 0;
        teamRay.push(pk);
    }
    
    var packet = {"a":"storage","p":{"token":script[0].token,"team":teamRay}};
    socketAdmin.Send(packet, function(response) {
        if( response.result == 1 ) {
            pokestorageCancel();
        } else {
            alert(response.error);
        }
    });
    
}

function dialogPokemart(stock) {
    console.log("Pokemart Launch.");

    var title = "Pokemart";
    var id = "pokemart";
    var dialog = dialogsByTag[id];
    if( !dialog ) {
        var buttons = "<i id='chatIcon' onclick='pokemartCancel();' class='fa fa-times fa-2'></i>";
        dialog = dialogCreate(id,title,320,300,canvasWidth/2-320/2,100, buttons);
    } else {
        dialogShow(id);
    }

    var html = "<div id='pokemartItems' style='height: 220px;overflow-y:scroll;'>";
    for(var i=0;i<stock.length;i++) {
        var item = stock[i];
        item.quantity = 0;
        html += "<div class='pokedexEntry notCaught'>";
        html += "<img src='/play/images/items/"+item.file+"'/><br/>";
        html += item.name;
        html += "<br/>";
        html += "<sup>$" + item.price + "</sup>";
        html += "<br/><button class='button button-xs' onclick='pokemonQuantityChange("+item.id+",-1);'>-</button>&nbsp;<span id='quantity"+item.id+"'>" + item.quantity + "</span>";
        html += "&nbsp;<button class='button button-xs' onclick='pokemonQuantityChange("+item.id+",1);'>+</button>";
        html += "</div>";
    }
    html += "</div>";
    html += "<div id='pokemartPurchase' style='height: 28px;'>";
    html += "<span class='pull-left' id='pokemartTotal' style='color:white;top: 10px;position: relative;font-size: 18;'>Total: $0</span>";
    html += "<span class='pull-right'><button class='button ' onclick='pokemartCancel();'>Cancel</button>&nbsp;<button class='button' onclick='pokemartPurchase();'>Purchase</button></span>";
    html += "</div>";
    
    dialogUpdate(id, html);

    return true;
}


function pokemonQuantityChange(id, change) {
    var stock = script[0].items;
    var total = 0;
    for(var i=0;i<stock.length;i++) {
        var it = stock[i];
        if( it.id == id ) {
            it.quantity += change;
            if( it.quantity < 0 )
                it.quantity = 0;
            $("#quantity" + id).html(it.quantity.toLocaleString());
        }
        total += it.quantity * it.price;
    }
    
    if( total > money ) {
        $("#pokemartTotal").css("color","red");
    } else {
        $("#pokemartTotal").css("color","white");
    }
    
    $("#pokemartTotal").html("Total: $" + total.toLocaleString());
}


function pokemartPurchase() {
    var purchases = [];
    
    var stock = script[0].items;
    for(var i=0;i<stock.length;i++) {
        var it = stock[i];
        if( it.quantity > 0 ) {
            purchases.push({"id":parseInt(it.id,10), "quantity":parseInt(it.quantity,10)}); 
            it.quantity = 0; //prevent accidental purchases.
        }
    }
    
    var packet = {"a":"purchase","p":{"token":script[0].token,"purchases":purchases}};
    var ent = this;
    socketAdmin.Send(packet, function(response) {
        if( response.result == 1 ) {
            pokemartCancel();
        }
    });
    
    dialogPokemart(script[0].items); //reset    
}

function pokemartCancel() {
    dialogHide("pokemart");
    scriptPop();
}

function dialogPokedexUpdate(id, pokedex) {
    var html = "";

    for(var i=0;i<pokemonList.length;i++) {
        var p = pokemonList[i];
        var id = "000" + p.id;
        id = id.substring(id.length-3,id.length);
        var rarity = p.rarity;
        if( rarity == "" )
                rarity = "Evolve";

        var cls = "notCaught";
        for(var k=0;k<pokedex.length;k++) {
                if( pokedex[k].pokemon_id == p.id) {
                        cls = "caught";
                }
        }

        html += "<div class='pokedexEntry "+cls+"'>";
        html += "<img src='/play/images/icons/"+id+".png'/><br/>";
        html += p.name;
        html += "<br/>";
        html += "<sup>" + rarity + "</sup>";
        html += "</div>";

    }

    dialogUpdate("pokedex", html);
}

function dialogMap() {

	return true;
}

function dialogPMClose(id) {
	//close the pm object.
	if( pm[id.replace("pm_","")] ) {
		delete pm[id.replace("pm_","")];
	}

	//close the dialog
	dialogClose(id);
}

function dialogHide(id) {
	$("#" + id).css("display","none");
}
function dialogShow(id) {
	$("#" + id).css("display","block");
}
function dialogIsOpen(id) {
    if( $("#" + id).length > 0 ) {
        return $("#" + id).css("display") == "block";
    }
    return false;
}


function dialogExists(id) {
	if( $("#" + id).length > 0 ) {
		return true;
	}
	return false;
}

function dialogClose(id) {
	if( dialogsByTag[id] ) {
		delete dialogsByTag[id];
		$("#" + id).remove();
	}
}

function dialogMessage(title, message, btnOk) {
	var html = "<b>"+title+"</b><p>"+message+"</p><p align='right'><span class='button button-grey' onclick='dialogMessageDismiss();'>"+btnOk+"</span></p>";

	$(".message").html(html);
	$(".message").css("display","block");
}

function dialogLogin() {
	$(".login").css("display","block");
}

function dialogMessageDismiss() {
	$(".message").css("display","none");
}
