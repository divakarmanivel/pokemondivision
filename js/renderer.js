function renderer() {

	var characterRow = 1;
	var frameIndex = 0;
	var tickCount = 0;
	var ticksPerFrame = 0;
	var numberOfFrames = 3;

	// render the minimap
	function renderMinimap() {
			var startCol = Math.floor(playerXPos/tileSize) - Math.floor(mapcanvas.width / 9);
			var endCol = Math.floor(playerXPos/tileSize) + Math.floor(mapcanvas.width / 9);
			var startRow = Math.floor(playerYPos/tileSize) - Math.floor(mapcanvas.height / 9);
			var endRow = Math.floor(playerYPos/tileSize) + Math.floor(mapcanvas.height / 9);

			var nc = (Math.abs(startCol) + endCol);
			var nr = (Math.abs(startRow) + endRow);
			var pc = (Math.abs(startCol) - endCol);
			var pr = (Math.abs(startRow) - endRow);
			var pointerWidth = mapcanvas.width / Math.abs(((startCol>0)?pc:nc));
			var pointerHeight = mapcanvas.height / Math.abs(((startRow>0)?pr:nr));
			
			var offsetX = -Math.floor(playerXPos/tileSize) + startCol * pointerWidth;
			var offsetY = -Math.floor(playerYPos/tileSize) + startRow * pointerHeight;
			
			mapcontext.clearRect(0, 0, mapcanvas.width, mapcanvas.height);
			mapcontext.globalAlpha = 0.5;
			mapcontext.fillStyle = 'black';
			mapcontext.fillRect(0, 0, mapcanvas.width, mapcanvas.height);

			// render objects
			for (i = startRow; i <= endRow; i++) {
				for (j = startCol; j <= endCol; j++) {
					var x = (i - startRow) * pointerWidth;
					var y = (j - startCol) * pointerHeight;
					if (i >= 0 && j >= 0 && i < mapRows && j < mapCols) {
						var path_tile = path_map[i][j]; //first draw the path layers
						if (path_tile === 0 && path_tile != null) {
							mapcontext.fillStyle = 'green'; //draw grass tile
						}
						var obstacle_tile = obstacle_map[i][j]; //second draw the object layers
						if (obstacle_tile == 1 && obstacle_tile != null) {
							mapcontext.fillStyle = 'gray'; //draw bush tile
						}
						var npc_tile = npc_map[i][j]; //third draw the npc layers
						if (npc_tile !== 0 && npc_tile != null) {
								mapcontext.fillStyle = 'brown'; //draw npc tile
						}
						var pokemon_tile = pokemon_map[i][j]; //lastly draw the pokemon layers
						if (pokemon_tile !== 0 && pokemon_tile != null) {
								mapcontext.fillStyle = 'yellow'; //draw pokemon tile
						}
						mapcontext.fillRect(y, x, pointerWidth, pointerHeight); //draw on minimap
					}
				}
			}
			mapcontext.fillStyle = 'red';
			mapcontext.fillRect(Math.floor(mapcanvas.width / 2), Math.floor(mapcanvas.height / 2), pointerWidth, pointerHeight); //draw player tile

			mapcontext.globalAlpha = 1.0;
	}
	
	// render the level
	function renderLevel() {
		if (!loading) {
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
						var path_tile = path_map[i][j]; //first draw the path layers
						if (path_tile === 0 && path_tile != null) {
							drawTile(outdoorTiles, 103, 1, 16, 16, y, x); //draw grass tile
						}
						var obstacle_tile = obstacle_map[i][j]; //second draw the object layers
						if (obstacle_tile == 1 && obstacle_tile != null) {
							drawTile(outdoorTiles, 120, 1, 16, 16, y, x); //draw bush tile
						}
						var npc_tile = npc_map[i][j]; //third draw the npc layers
						if (npc_tile !== 0 && npc_tile != null) {
							var spriteID = npc_map_data["m:" + 1 + "r:" + i + "c:" + j].value;
							var sprite = npc_map_data["m:" + 1 + "r:" + i + "c:" + j].frameIndex;
							if (spriteID >= 2000) {
								var NPC = NPCDatabase[(npc_tile - 2000)].sprites[sprite];
								drawTile(NPC, 0, 0, tileSize, tileSize, y, x); //draw npc tile 
							}
						}
						var pokemon_tile = pokemon_map[i][j]; //lastly draw the pokemon layers
						if (pokemon_tile !== 0 && pokemon_tile != null) {
							var pokemonID = pokemon_map_data["m:" + 1 + "r:" + i + "c:" + j].value;
							var pokemonFrame = pokemon_map_data["m:" + 1 + "r:" + i + "c:" + j].frameIndex;
							if (pokemonID < 2000) {
								var pokemon = pokemonDatabase[pokemon_tile].sprites[pokemonFrame];
								drawTile(pokemon, 0, 0, tileSize, tileSize, y, x); //draw pokemon tile
							}
						}
					} else {
						drawTile(outdoorTiles, 1, 1, 16, 16, y, x); //draw sand tile when the view is outside the map
					}
				}
			}
			// draw player tile
			drawTile(charTiles, frameIndex * 32, characterRow * 32, 32, 32, playerCol * tileSize, playerRow * tileSize);
		}
	}

	function drawTile(tile, sourceX, sourceY, sWidth, sHeight, destinationX, destinationY) {
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
		if (sX !== 0 || sY !== 0) {
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
				var steps = 1;
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

	// update the minimap
	function updateMinimap() {
		window.requestAnimationFrame(updateMinimap);
		// rendering minimap
		renderMinimap();
	}
	updateGame();
	updateMinimap();
}