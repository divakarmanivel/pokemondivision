// render the minimap
function renderMinimap() {
    if (!loading) {
        var bg_color = "black";
        var grass_color = "green";
        var bush_color = "gray";
        var npc_color = "brown";
        var pokemon_color = "yellow";
        var player_color = "red";
        mapcontext.save();
        // clear the map canvas
        mapcontext.clearRect(0, 0, mapcanvas.width, mapcanvas.height);
        if(showMap) {
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

            mapcontext.globalAlpha = 0.5;
            mapcontext.fillStyle = bg_color;
            mapcontext.fillRect(0, 0, mapcanvas.width, mapcanvas.height);

            // render objects
            for (i = startRow; i <= endRow; i++) {
                for (j = startCol; j <= endCol; j++) {
                    var x = (i - startRow) * pointerWidth;
                    var y = (j - startCol) * pointerHeight;
                    if (i >= 0 && j >= 0 && i < mapRows && j < mapCols) {
                        var path_tile = path_map[i][j]; //first draw the path layers
                        if (path_tile === 0 && path_tile != null) {
                            mapcontext.fillStyle = grass_color; //draw grass tile
                        }
                        var obstacle_tile = obstacle_map[i][j]; //second draw the object layers
                        if (obstacle_tile == 1 && obstacle_tile != null) {
                            mapcontext.fillStyle = bush_color; //draw bush tile
                        }
                        var npc_tile = npc_map[i][j]; //third draw the npc layers
                        if (npc_tile !== 0 && npc_tile != null) {
                            mapcontext.fillStyle = npc_color; //draw npc tile
                        }
                        var pokemon_tile = pokemon_map[i][j]; //lastly draw the pokemon layers
                        if (pokemon_tile !== 0 && pokemon_tile != null) {
                            mapcontext.fillStyle = pokemon_color; //draw pokemon tile
                        }
                        mapcontext.fillRect(y, x, pointerWidth, pointerHeight); //draw on minimap
                    }
                }
            }
            mapcontext.fillStyle = player_color;
            mapcontext.fillRect(Math.floor(mapcanvas.width / 2), Math.floor(mapcanvas.height / 2), pointerWidth, pointerHeight); //draw player tile

            mapcontext.globalAlpha = 1.0;
        }
        mapcontext.restore();
    }
}

// update the minimap
function updateMinimap() {
    window.requestAnimationFrame(updateMinimap);
    // rendering minimap
    renderMinimap();
}