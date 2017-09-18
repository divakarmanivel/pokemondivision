function collisionCheck(column,row) {
	// check for collisions
	var baseCol = column;
	var baseRow = row;
	var left = baseCol - 1;
	var right = baseCol + 1;
	var top = baseRow - 1;
	var bottom = baseRow + 1;
	var collision = false;

	if (sX < 0 && map[baseRow][left] != 0) {
		collision = true;
	} else if (sX > 0 && map[baseRow][right] != 0) {
		collision = true;
	} else if (sY < 0 && map[top][baseCol] != 0) {
		collision = true;
	} else if (sY > 0 && map[bottom][baseCol] != 0) {
		collision = true;
	}
	return collision;
}