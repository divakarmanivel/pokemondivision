function renderer() {

	var characterRow = 1;
	var frameIndex = 0;
	var tickCount = 0;
	var ticksPerFrame = 0;
	var numberOfFrames = 3;

	// render the minimap
	function renderMinimap() {
		var startCol = Math.floor(playerXPos / tileSize) - Math.floor(mapcanvas.width / 9);
		var endCol = Math.floor(playerXPos / tileSize) + Math.floor(mapcanvas.width / 9);
		var startRow = Math.floor(playerYPos / tileSize) - Math.floor(mapcanvas.height / 9);
		var endRow = Math.floor(playerYPos / tileSize) + Math.floor(mapcanvas.height / 9);

		var nc = (Math.abs(startCol) + endCol);
		var nr = (Math.abs(startRow) + endRow);
		var pc = (Math.abs(startCol) - endCol);
		var pr = (Math.abs(startRow) - endRow);
		var pointerWidth = mapcanvas.width / Math.abs(((startCol > 0) ? pc : nc));
		var pointerHeight = mapcanvas.height / Math.abs(((startRow > 0) ? pr : nr));

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

			context.save();
			// clear the canvas
			context.clearRect(0, 0, canvas.width, canvas.height);

			// render objects
			for (i = startRow; i <= endRow; i++) {
				for (j = startCol; j <= endCol; j++) {
					var x = (i - startRow) * tileSize - offsetX;
					var y = (j - startCol) * tileSize - offsetY;
					if (i >= 0 && j >= 0 && i < mapRows && j < mapCols) {
						//first draw the path layers
						var path_tile = path_map[i][j];
						if (path_tile === 0 && path_tile != null && path_tile != undefined) {
							var grass = OutdoorTiles[6];
							drawTile(grass, 0, 0, tileSize, tileSize, y, x); //draw grass tile
						}
						//second draw the object layers
						var obstacle_tile = obstacle_map[i][j];
						if (obstacle_tile == 1 && obstacle_tile != null && obstacle_tile != undefined) {
							var bush = OutdoorTiles[7];
							drawTile(bush, 0, 0, tileSize, tileSize, y, x); //draw bush tile
						}
						//third draw the npc layers
						var npc_tile = npc_map[i][j];
						if (npc_tile !== 0 && npc_tile != null && npc_tile != undefined) {
							var spriteID = npc_map_data["m:" + map_number + "r:" + i + "c:" + j].value;
							var sprite = npc_map_data["m:" + map_number + "r:" + i + "c:" + j].frameIndex;
							var spriteInteraction = npc_map_data["m:" + map_number + "r:" + i + "c:" + j].interaction;
							if (spriteID >= 2000) {
								var NPC = NPCDatabase[(npc_tile - 2000)].sprites[sprite];
								drawTile(NPC, 0, 0, tileSize, tileSize, y, x); //draw npc tile
								if (spriteInteraction != null || spriteInteraction != undefined) {
									if ((i - 1) >= 0 && i < mapRows) {
										var dx = ((i - 1) - startRow) * tileSize - offsetX;
										var emotion = EmotionsTiles[8];
										drawTile(emotion, 0, 0, tileSize, tileSize, y, dx); //draw npc interaction
									}
								}
							}
						}
						//fourth draw the pokemon layers
						var pokemon_tile = pokemon_map[i][j];
						if (pokemon_tile !== 0 && pokemon_tile != null && pokemon_tile != undefined) {
							var pokemonID = pokemon_map_data["m:" + map_number + "r:" + i + "c:" + j].value;
							var pokemonFrame = pokemon_map_data["m:" + map_number + "r:" + i + "c:" + j].frameIndex;
							var pokemonInteraction = pokemon_map_data["m:" + map_number + "r:" + i + "c:" + j].interaction;
							if (pokemonID < 2000) {
								var pokemon = pokemonDatabase[pokemon_tile].sprites[pokemonFrame];
								drawTile(pokemon, 0, 0, tileSize, tileSize, y, x); //draw pokemon tile
								if (pokemonInteraction != null || pokemonInteraction != undefined) {
									if ((i - 1) >= 0 && i < mapRows) {
										var dx = ((i - 1) - startRow) * tileSize - offsetX;
										var emotion = EmotionsTiles[8];
										drawTile(emotion, 0, 0, tileSize, tileSize, y, dx); //draw pokemon interaction
									}
								}
							}
						}
					} else {
						var sand = OutdoorTiles[0];
						drawTile(sand, 0, 0, tileSize, tileSize, y, x); //draw sand tile when the view is outside the map
					}
				}
			}
			// finally draw player tile
			drawTile(charTiles, frameIndex * 32, characterRow * 32, 32, 32, playerCol * tileSize, playerRow * tileSize);
			// draw menu
			if (btn_start) {
				drawMenu();
			}
			context.restore();
		}
	}

	function drawMenu() {
		menucontext.clearRect(0, 0, menucanvas.width, menucanvas.height);
		menucontext.fillStyle = "#383838";
		menucontext.fillRect(0, 0, menucanvas.width, menucanvas.height);
		menucontext.fillStyle = "#fff";
		menucontext.fillRect(10, controls_start.height + 20, menucanvas.width - 20, 50);
		menucontext.fillRect(10, controls_start.height + 80, menucanvas.width - 20, 50);
		menucontext.fillRect(10, controls_start.height + 140, menucanvas.width - 20, 50);
	}

	function drawTile(tile, sourceX, sourceY, sWidth, sHeight, destinationX, destinationY, light = false) {
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
		var playerCol = Math.round(playerXPos / tileSize);
		var playerRow = Math.round(playerYPos / tileSize);

		// select character row
		if (sX !== 0 || sY !== 0) {
			if (sX > 0) {
				characterRow = 3; // right
			} else if (sX < 0) {
				characterRow = 2; // left
			} else if (sY > 0) {
				characterRow = 1; // down
			} else if (sY < 0) {
				characterRow = 0; //up
			} else {
				// default down
				characterRow = 1;
				frameIndex = 0;
			}

			// select character frame
			tickCount += 1;
			if (tickCount > ticksPerFrame) {
				tickCount = 0;
				if (frameIndex < numberOfFrames - 1) {
					frameIndex += 1;
				} else {
					frameIndex = 0;
				}
			}

			// check for collisions and update if no collision detected
			var collision = collisionCheck(playerCol, playerRow);
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

		// draw interactions based on character position
		if (btn_a == 1) {
			var interactiveRow = playerRow;
			var interactiveCol = playerCol;
			if (characterRow == 3) {
				interactiveCol = interactiveCol + 1;
			} else if (characterRow == 2) {
				interactiveCol = interactiveCol - 1;
			} else if (characterRow == 1) {
				interactiveRow = interactiveRow + 1;
			} else if (characterRow == 0) {
				interactiveRow = interactiveRow - 1;
			}
			var npc = npc_map_data["m:" + map_number + "r:" + interactiveRow + "c:" + interactiveCol];
			var pokemon = pokemon_map_data["m:" + map_number + "r:" + interactiveRow + "c:" + interactiveCol];
			if (pokemon != null && pokemon != undefined && pokemon.interaction != null && pokemon.interaction != undefined) {
				alert(pokemon.interaction);
			} else if (npc != null && npc != undefined && npc.interaction != null && npc.interaction != undefined) {
				alert(npc.interaction);
			}
		}
		// update the game
		window.requestAnimationFrame(updateGame);
		// rendering level
		renderLevel();
		// reset all inputs
		reset_inputs();
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