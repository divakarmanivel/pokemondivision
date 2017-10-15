function renderer() {

	var characterRow = 1;
	var frameIndex = 0;
	var tickCount = 0;
	var ticksPerFrame = 2;
	var numberOfFrames = 3;
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
						outdoorTiles,
						103,
						1,
						16,
						16,
						j * tileSize,
						i * tileSize,
						tileSize + 1,
						tileSize + 1);
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
							drawTile(outdoorTiles, 120, 1, 16, 16, y, x);
						} else if (tile == 2 && tile != null) {
							var pokemon = pokemonDatabase[1].sprites[2];
							drawTile(pokemon, 0, 0, tileSize, tileSize, y, x);
						}
					} else {
						drawTile(outdoorTiles, 1, 1, 16, 16, y, x);
					}
				}
			}
			// draw player
			drawTile(charTiles, frameIndex * 32, characterRow * 32, 32, 32, playerCol * tileSize, playerRow * tileSize);
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
			tileSize + 1,
			tileSize + 1);
	}

	// update the game variables with this function
	function updateGame() {
		// update any movements
		if (sX != 0 || sY != 0) {
			if (sX > 0) {
				characterRow = 3;
			} else if (sX < 0) {
				characterRow = 2;
			} else if (sY < 0) {
				characterRow = 0;
			} else if (sY > 0) {
				characterRow = 1;
			} else {
				characterRow = 1;
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
				var steps = 2;
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
		} else {
			frameIndex = 0;
		}
		// update the game
		window.requestAnimationFrame(updateGame);
		// rendering level
		renderLevel();
	}
	updateGame();
}