var objectIndex = 0;

function initMap(numrows, numcols) {   
	var new_map = [];
	var new_obstacle_map = [];
	for (var i = 0; i < numrows; i++) {      
		var columns = [];      
		for (var j = 0; j < numcols; j++) {         
			columns[j] = 0;      
		}
		new_map[i] = columns;
		new_obstacle_map[i] = columns.slice(); 
	}

	for (var i = 0; i < new_map.length; i++) {
		for (var j = 0; j < new_map[1].length; j++) {
			if (i == 0 || j == 0 || i == new_map.length - 1 || j == new_map[1].length - 1) {
				setObject(new_map, new_obstacle_map, i, j, 1);
			}    
		}
	}

	    
	return {
		map: new_map,
		obstacle_map: new_obstacle_map
	};
}

function setObject(map, obstacle_map, row, col, value)  {
	map[row][col] = value;
	obstacle_map[row][col] = 1;
}

function setPokemon(map, obstacle_map, row, col, value)  {
	map[row][col] = value;
	obstacle_map[row][col] = 1;
}

function setPokemon(map, obstacle_map, row, col, value, moving)  {
	map[row][col] = value;
	obstacle_map[row][col] = 1;
	/*
	var pokemon = createObject(map, row, col); 
	//Something I'm trying to make the engine remember pokemon positions
	storage.setItem(objectIndex, pokemon);/*
	if (moving) {
		var rand = Math.floor((Math.random() * 5) + 1);
		setInterval(function () {
			var rowRand = Math.floor(Math.random() * 2);
			var colRand = Math.floor(Math.random() * 2);
			if (obstacle_map[row + rowRand][col + colRand] == 0) {

				map[row + rowRand][col + colRand] = value;
				map[row][col] = 0;
				obstacle_map[row + rowRand][col + colRand] = 1;
				obstacle_map[row][col] = 0;
			}
			//var collision = collisionCheck(col+colRand, row+rowRand)
		}, rand * 1000);
	}*/
}

function updateMap() {
	var rand = Math.floor((Math.random() * 5) + 1);
	setInterval(function () {
		for (var i = 0; i < objectIndex; i++) {
			var object = storage.getItem(i);
			var rowRand = object.row + Math.floor(Math.random() * 2);
			var colRand = object.col + Math.floor(Math.random() * 2);
			if (object.obstacle_map[rowRand][colRand] == 0) {
				object.map[rowRand][colRand] = value;
				object.map[object.row][object.col] = 0;
				object.obstacle_map[rowRand][colRand] = 1;
				object.obstacle_map[object.row][object.col] = 0;
				object.row = rowRand;
				object.col = colRand;
				storage.setItem(i, object);
			}
		}
	}, rand * 1000);
}
//updateMap();

function createObject(map, obstacle_map, row, col) {
	var object = {};
	object.index = objectIndex;
	object.map = map;
	object.obstacle_map = obstacle_map;
	object.row = row;
	object.col = col;
	objectIndex++;
	return object;
}