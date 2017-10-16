var npc_data = [];
var moving_npc_data = [];
var moving_keys = [];
var rotating_npc_data = [];
var rotating_keys = [];
var map_number = 0;

function initMap(map_num, numrows, numcols) {
	map_number = map_num;
	var new_path_map = [];
	var new_obstacle_map = [];
	var new_npc_map = [];
	for (var i = 0; i < numrows; i++) {      
		var columns = [];      
		for (var j = 0; j < numcols; j++) {         
			columns[j] = 0;      
		}
		new_path_map[i] = columns;
		new_obstacle_map[i] = columns.slice();
		new_npc_map[i] = columns.slice();
	}

	return {
		path_map: new_path_map,
		obstacle_map: new_obstacle_map,
		npc_map: new_npc_map
	};
}

function setBorders() {
	for (var i = 0; i < path_map.length; i++) {
		for (var j = 0; j < path_map[1].length; j++) {
			if (i == 0 || j == 0 || i == path_map.length - 1 || j == path_map[1].length - 1) {
				setObject(i, j, 1);
			}    
		}
	}
}

function setPath(row, col, value) {
	path_map[row][col] = value;
}

function setObject(row, col, value)  {
	obstacle_map[row][col] = value;
}

function setNPC(row, col, value)  {
	var key = "m:" + map_number + "r:" + row + "c:" + col;
	npc_map[row][col] = value;
	var npc = [];
	npc.map_num = map_number;
	npc.row = row;
	npc.col = col;
	npc.value = value;
	npc.frameIndex = 2;
	npc_data[key] = npc;
}

function setRotatingNPC(row, col, value)  {
	var key = "m:" + map_number + "r:" + row + "c:" + col;
	npc_map[row][col] = value;
	var npc = [];
	npc.map_num = map_number;
	npc.row = row;
	npc.col = col;
	npc.value = value;
	npc.frameIndex = 2;
	npc_data[key] = npc;
	rotating_npc_data[key] = npc;
	rotating_keys.push(key);
}

function setMovingNPC(row, col, value)  {
	var key = "m:" + map_number + "r:" + row + "c:" + col;
	npc_map[row][col] = value;
	var npc = [];
	npc.map_num = map_number;
	npc.row = row;
	npc.col = col;
	npc.value = value;
	npc.frameIndex = 2;
	npc_data[key] = npc;
	moving_npc_data[key] = npc;
	moving_keys.push(key);
}

function updateMapData() {
	var keyat = rotating_keys.length * Math.random() << 0;
	var npc = rotating_npc_data[rotating_keys[keyat]];
	if (npc.map_num != undefined && npc.row != undefined && npc.col != undefined && npc.value != undefined) {
		var rotating_npc = [];
		var rand = Math.floor(Math.random() * 8);
		rotating_npc.map_num = npc.map_num;
		rotating_npc.row = npc.row;
		rotating_npc.col = npc.col;
		rotating_npc.value = npc.value;
		rotating_npc.frameIndex = rand;
		rotating_npc_data[rotating_keys[keyat]] = rotating_npc;
		npc_data[rotating_keys[keyat]] = rotating_npc;
	}

	keyat = moving_keys.length * Math.random() << 0;
	npc = moving_npc_data[moving_keys[keyat]];
	if (npc.map_num != undefined && npc.row != undefined && npc.col != undefined && npc.value != undefined) {
		var row = Math.floor(Math.random() * 2);
		row *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
		var col = Math.floor(Math.random() * 2);
		col *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
		var newrow = npc.row + row;
		var newcol = npc.col + col;
		var collision = collisionCheckNPC(newcol, newrow);
		if (!collision) {
			var fIndex;
			if (newrow > npc.row) {
				fIndex = 2;
			} else if (newrow < npc.row) {
				fIndex = 0;
			} else if (newcol > npc.col) {
				fIndex = 6;
			} else {
				fIndex = 4;
			}
			fIndex += Math.floor(Math.random() * 2);
			var moving_npc = [];
			var newkey = "m:" + npc.map_num + "r:" + newrow + "c:" + newcol;
			moving_npc.map_num = npc.map_num;
			moving_npc.row = newrow;
			moving_npc.col = newcol;
			moving_npc.value = npc.value;
			moving_npc.frameIndex = fIndex;
			moving_npc_data[newkey] = moving_npc;
			moving_keys.push(newkey);
			npc_data[newkey] = moving_npc;
			npc_map[npc.row][npc.col] = 0;
			npc_map[newrow][newcol] = npc.value;
			moving_npc_data.splice(keyat, 1);
			moving_keys.splice(keyat, 1);
			var oldkey = npc_data.indexOf(npc);
			npc_data.splice(oldkey, 1);
		}
	}
}

setInterval(function () {
	updateMapData();
}, 1000);