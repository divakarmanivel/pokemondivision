var map_number = 0;

var npc_map_data = [];
var moving_npc_data = [];
var moving_npc_keys = [];
var rotating_npc_data = [];
var rotating_npc_keys = [];

var pokemon_map_data = [];
var moving_pokemon_data = [];
var moving_pokemon_keys = [];
var rotating_pokemon_data = [];
var rotating_pokemon_keys = [];

function initMap(map_num, numrows, numcols) {
	map_number = map_num;
	var new_path_map = [];
	var new_obstacle_map = [];
	var new_npc_map = [];
	var new_pokemon_map = [];
	for (var i = 0; i < numrows; i++) {      
		var columns = [];      
		for (var j = 0; j < numcols; j++) {         
			columns[j] = 0;      
		}
		new_path_map[i] = columns;
		new_obstacle_map[i] = columns.slice();
		new_npc_map[i] = columns.slice();
		new_pokemon_map[i] = columns.slice();
	}

	return {
		path_map: new_path_map,
		obstacle_map: new_obstacle_map,
		npc_map: new_npc_map,
		pokemon_map: new_pokemon_map
	};
}

function setBorders() {
	for (var i = 0; i < path_map.length; i++) {
		for (var j = 0; j < path_map[1].length; j++) {
			if (i === 0 || j === 0 || i == path_map.length - 1 || j == path_map[1].length - 1) {
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
	npc_map_data[key] = npc;
}

function setPokemon(row, col, value)  {
	var key = "m:" + map_number + "r:" + row + "c:" + col;
	pokemon_map[row][col] = value;
	var pokemon = [];
	pokemon.map_num = map_number;
	pokemon.row = row;
	pokemon.col = col;
	pokemon.value = value;
	pokemon.frameIndex = 2;
	pokemon_map_data[key] = pokemon;
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
	npc_map_data[key] = npc;
	rotating_npc_data[key] = npc;
	rotating_npc_keys.push(key);
}

function setRotatingPokemon(row, col, value)  {
	var key = "m:" + map_number + "r:" + row + "c:" + col;
	pokemon_map[row][col] = value;
	var pokemon = [];
	pokemon.map_num = map_number;
	pokemon.row = row;
	pokemon.col = col;
	pokemon.value = value;
	pokemon.frameIndex = 2;
	pokemon_map_data[key] = pokemon;
	rotating_pokemon_data[key] = pokemon;
	rotating_pokemon_keys.push(key);
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
	npc_map_data[key] = npc;
	moving_npc_data[key] = npc;
	moving_npc_keys.push(key);
}

function setMovingPokemon(row, col, value)  {
	var key = "m:" + map_number + "r:" + row + "c:" + col;
	pokemon_map[row][col] = value;
	var pokemon = [];
	pokemon.map_num = map_number;
	pokemon.row = row;
	pokemon.col = col;
	pokemon.value = value;
	pokemon.frameIndex = 2;
	pokemon_map_data[key] = pokemon;
	moving_pokemon_data[key] = pokemon;
	moving_pokemon_keys.push(key);
}

function updateNPCMapData() {
	var keyat = rotating_npc_keys.length * Math.random() << 0;
	var npc;
	if (keyat !== undefined && keyat !== 0) {
		npc = rotating_npc_data[rotating_npc_keys[keyat]];
		if (npc.map_num !== undefined && npc.row !== undefined && npc.col !== undefined && npc.value !== undefined) {
			var rotating_npc = [];
			var rand = Math.floor(Math.random() * 8);
			rotating_npc.map_num = npc.map_num;
			rotating_npc.row = npc.row;
			rotating_npc.col = npc.col;
			rotating_npc.value = npc.value;
			rotating_npc.frameIndex = rand;
			rotating_npc_data[rotating_npc_keys[keyat]] = rotating_npc;
			npc_map_data[rotating_npc_keys[keyat]] = rotating_npc;
		}
	}

	keyat = moving_npc_keys.length * Math.random() << 0;
	if (keyat !== undefined && keyat !== 0) {
		npc = moving_npc_data[moving_npc_keys[keyat]];
		if (npc.map_num !== undefined && npc.row !== undefined && npc.col !== undefined && npc.value !== undefined) {
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
				moving_npc_keys.push(newkey);
				npc_map_data[newkey] = moving_npc;
				npc_map[npc.row][npc.col] = 0;
				npc_map[newrow][newcol] = npc.value;
				moving_npc_data.splice(keyat, 1);
				moving_npc_keys.splice(keyat, 1);
				var oldkey = npc_map_data.indexOf(npc);
				npc_map_data.splice(oldkey, 1);
			}
		}
	}
}

function updatePokemonMapData() {
	var keyat = rotating_pokemon_keys.length * Math.random() << 0;
	var pokemon;
	if (keyat !== undefined && keyat !== 0) {
		pokemon = rotating_pokemon_data[rotating_pokemon_keys[keyat]];
		if (pokemon.map_num !== undefined && pokemon.row !== undefined && pokemon.col !== undefined && pokemon.value !== undefined) {
			var rotating_pokemon = [];
			var rand = Math.floor(Math.random() * 8);
			rotating_pokemon.map_num = pokemon.map_num;
			rotating_pokemon.row = pokemon.row;
			rotating_pokemon.col = pokemon.col;
			rotating_pokemon.value = pokemon.value;
			rotating_pokemon.frameIndex = rand;
			rotating_pokemon_data[rotating_pokemon_keys[keyat]] = rotating_pokemon;
			pokemon_map_data[rotating_pokemon_keys[keyat]] = rotating_pokemon;
		}
	}

	keyat = moving_pokemon_keys.length * Math.random() << 0;
	if (keyat !== undefined && keyat !== 0) {
		pokemon = moving_pokemon_data[moving_pokemon_keys[keyat]];
		if (pokemon.map_num !== undefined && pokemon.row !== undefined && pokemon.col !== undefined && pokemon.value !== undefined) {
			var row = Math.floor(Math.random() * 2);
			row *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
			var col = Math.floor(Math.random() * 2);
			col *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
			var newrow = pokemon.row + row;
			var newcol = pokemon.col + col;
			var collision = collisionCheckNPC(newcol, newrow);
			if (!collision) {
				var fIndex;
				if (newrow > pokemon.row) {
					fIndex = 2;
				} else if (newrow < pokemon.row) {
					fIndex = 0;
				} else if (newcol > pokemon.col) {
					fIndex = 6;
				} else {
					fIndex = 4;
				}
				fIndex += Math.floor(Math.random() * 2);
				var moving_pokemon = [];
				var newkey = "m:" + pokemon.map_num + "r:" + newrow + "c:" + newcol;
				moving_pokemon.map_num = pokemon.map_num;
				moving_pokemon.row = newrow;
				moving_pokemon.col = newcol;
				moving_pokemon.value = pokemon.value;
				moving_pokemon.frameIndex = fIndex;
				moving_pokemon_data[newkey] = moving_pokemon;
				moving_pokemon_keys.push(newkey);
				pokemon_map_data[newkey] = moving_pokemon;
				pokemon_map[pokemon.row][pokemon.col] = 0;
				pokemon_map[newrow][newcol] = pokemon.value;
				moving_pokemon_data.splice(keyat, 1);
				moving_pokemon_keys.splice(keyat, 1);
				var oldkey = pokemon_map_data.indexOf(pokemon);
				pokemon_map_data.splice(oldkey, 1);
			}
		}
	}
}


setInterval(function() {
	updateNPCMapData();
}, 1000);


setInterval(function() {
	updatePokemonMapData();
}, 1000);