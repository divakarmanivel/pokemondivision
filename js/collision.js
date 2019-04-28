function collisionCheck(column, row) {
	// check for collisions around the player
	var baseCol = column;
	var baseRow = row;
	var left = baseCol - 1;
	var right = baseCol + 1;
	var top = baseRow - 1;
	var bottom = baseRow + 1;
	var collision = false;

	if (sX < 0 && (obstacle_map[baseRow][left] !== 0 || npc_map[baseRow][left] !== 0 || pokemon_map[baseRow][left] !== 0)) {
		collision = true;
	} else if (sX > 0 && (obstacle_map[baseRow][right] !== 0 || npc_map[baseRow][right] !== 0 || pokemon_map[baseRow][right] !== 0)) {
		collision = true;
	} else if (sY < 0 && (obstacle_map[top][baseCol] !== 0 || npc_map[top][baseCol] !== 0 || pokemon_map[top][baseCol] !== 0)) {
		collision = true;
	} else if (sY > 0 && (obstacle_map[bottom][baseCol] !== 0 || npc_map[bottom][baseCol] !== 0 || pokemon_map[bottom][baseCol] !== 0)) {
		collision = true;
	}
	return collision;
}

function collisionCheckNPC(column, row) {
	// check for collisions around npc
	var collision = false;

	if (obstacle_map[row][column] !== 0 || npc_map[row][column] !== 0 || pokemon_map[row][column] !== 0 || (column == Math.round(playerXPos / tileSize) && row == Math.round(playerYPos / tileSize))) {
		collision = true;
	}
	return collision;
}