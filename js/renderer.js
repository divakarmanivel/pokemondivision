function renderer() {

	var characterRow = 2;
	var frameIndex = 0;
	var tickCount = 0;
	var ticksPerFrame = 0;
	var numberOfFrames = 9;
	var bgRendered = false;

	function renderBackground() {
		if (!loading) {
			bgRendered = true;
			bgcontext.clearRect(0, 0, bgcanvas.width, bgcanvas.height);
			var w = Math.floor(camWidth / tileSize);
			var h = Math.floor(camHeight / tileSize);
			if (mapCols < w) {
				w = mapCols - 1;
			}
			if (mapRows < h) {
				h = mapRows - 1;
			}
			for (var i = 0; i <= h; i++) {
				for (var j = 0; j <= w; j++) {
					bgcontext.drawImage(
						grassTiles,
						0,
						160,
						tileSize,
						tileSize,
						j * tileSize,
						i * tileSize,
						tileSize,
						tileSize);
				}
			}
		}
	}

	// render the level
	function renderLevel() {
		if (!loading) {
			if (!bgRendered) {
				renderBackground();
			}
			var startCol = Math.floor(camX / tileSize);
			var endCol = startCol + Math.floor(camWidth / tileSize);
			var startRow = Math.floor(camY / tileSize);
			var endRow = startRow + Math.floor(camHeight / tileSize);

			var offsetX = -camX + startCol * tileSize;
			var offsetY = -camY + startRow * tileSize;
			// clear the canvas
			context.clearRect(0, 0, canvas.width, canvas.height);

			// render objects
			for (i = startRow; i <= endRow; i++) {
				for (j = startCol; j <= endCol; j++) {
					var x = (i - startRow) * tileSize - offsetX;
					var y = (j - startCol) * tileSize - offsetY;
					if (i >= 0 && j >= 0 && i < mapRows && j < mapCols) {
						var tile = map[i][j];
						if (tile == 1 && tile != null) {
							drawTile(waterTiles, 0, 160, tileSize, tileSize, y, x);
						} else if (tile == 2 && tile != null) {
							var pokemon = pokemonDatabase[1].sprites[2];
							drawTile(pokemon, 0, 0, tileSize, tileSize, y, x);
						}
					} else {
						drawTile(waterTiles, 0, 160, tileSize, tileSize, y, x);
					}
				}
			}
			// draw player
			drawTile(charTiles, frameIndex * 64, characterRow * 64, 64, 64, playerCol * tileSize, playerRow * tileSize);
		}
	}

	function drawTile(tile, sourceX, sourceY, sWidth,

		sHeight, destinationX, destinationY) {
		context.drawImage(
			tile,
			sourceX,
			sourceY,
			sWidth,
			sHeight,
			destinationX,
			destinationY,
			tileSize,
			tileSize);
	}

	// update the game variables with this function
	function updateGame() {
		// update any movements
		if (sX != 0 || sY != 0) {
			if (sX > 0) {
				characterRow = 3;
			} else if (sX < 0) {
				characterRow = 1;
			} else if (sY < 0) {
				characterRow = 0;
			} else if (sY > 0) {
				characterRow = 2;
			} else {
				characterRow = 2;
				frameIndex = 0;
			}

			tickCount += 1;
			if (tickCount > ticksPerFrame) {
				tickCount = 0;
				if (frameIndex < numberOfFrames - 1) {
					frameIndex += 1;
				} else {
					frameIndex = 0;
				}
			}
			var collision = collisionCheck(Math.round(playerXPos / tileSize), Math.round(playerYPos / tileSize));
			if (!collision) {
				difX = difX + sX;
				difY = difY + sY;
				sX = 0;
				sY = 0;
				var steps = 6;
				if (difX >= steps) {
					movement = true;
					camX += tileSize;
					playerXPos += tileSize;
					difX -= steps;
				} else if (difX <= -steps) {
					movement = true;
					camX -= tileSize;
					playerXPos -= tileSize;
					difX += steps;
				}
				if (difY >= steps) {
					movement = true;
					camY += tileSize;
					playerYPos += tileSize;
					difY -= steps;
				} else if (difY <= -steps) {
					movement = true;
					camY -= tileSize;
					playerYPos -= tileSize;
					difY += steps;
				}
			}
		}
		// update the game
		window.requestAnimationFrame(updateGame);
		// rendering level
		renderLevel();
	}
	updateGame();
}