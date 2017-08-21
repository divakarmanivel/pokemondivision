function renderer(){

	var characterRow=2;
	var frameIndex=0;
	var tickCount=0;
	var ticksPerFrame=0;
	var numberOfFrames=9;
	// render the level
	function renderLevel(){
	if(!loading){
		var startCol = Math.floor(camX/tileSize); 
		var endCol = startCol + Math.floor(camWidth/tileSize); 
		var startRow = Math.floor(camY/tileSize); 
		var endRow = startRow + Math.floor(camHeight/tileSize);
		
		var offsetX = -camX + startCol * tileSize; 
		var offsetY = -camY + startRow * tileSize;
		// clear the canvas
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		// render objects
		for(i=startRow;i<=endRow;i++){
			for(j=startCol;j<=endCol;j++){
				var x = (i-startRow)*tileSize-offsetX;
				var y = (j-startCol)*tileSize-offsetY;
				if(x>=0&&y>=0&&x<=camHeight&&y<=camWidth&&i>=0&&i>=0&&j>=0&&i<levelRows&&j<levelCols){
					var tile = level[i][j];
					if(tile==0&&tile!=null){
						context.drawImage(
							grassTiles,
							0,
							160,
							tileSize,
							tileSize,
							y,
							x,
							tileSize,
							tileSize);
					} else if(tile==1&&tile!=null){
						context.drawImage(
							waterTiles,
							0,
							160,
							tileSize,
							tileSize,
							y,
							x,
							tileSize,
							tileSize);
					}  else if(tile==2&&tile!=null){
            var pokemon = pokemonDatabase[66].sprites[2];
						context.drawImage(
							grassTiles,
							0,
							160,
							tileSize,
							tileSize,
							y,
							x,
							tileSize,
							tileSize);
						context.drawImage(
							pokemon,
							0,
							0,
							tileSize,
							tileSize,
							y,
							x,
							tileSize,
							tileSize);
					} 
				} else {
					context.drawImage(
							waterTiles,
							0,
							160,
							tileSize,
							tileSize,
							y,
							x,
							tileSize,
							tileSize);
				}
			}
		}
		
		// draw player
		context.drawImage(
			charTiles,
			frameIndex*64,
			characterRow*64,
			64, //sourcetilesize
			64, //sourcetilesize
			playerCol*tileSize,
			playerRow*tileSize,
			tileSize,
			tileSize);
	}
}	
	
// update the game variables with this function

	function updateGame() {
		// update any movements
		if(sX!=0||sY!=0){
			if(sX>0){characterRow=3;}
			else if(sX<0){characterRow=1;}
			else if(sY<0){characterRow=0;}
			else if(sY>0){characterRow=2;}
			tickCount+=1;
			if(tickCount>ticksPerFrame){
				tickCount=0;
				if(frameIndex<numberOfFrames-1){
					frameIndex+=1;
				}  else {
					frameIndex=0;
				}
			}
			var collision=collisionCheck();
			if(!collision){
			var difX=sX*tileSize;
			var difY=sY*tileSize;
			camX+=difX;
			camY+=difY;
			playerXPos+=difX;
			playerYPos+=difY;
			sX=0;
			sY=0;
			}
		}
		// update the game
		window.requestAnimationFrame(updateGame);
		// rendering level
		renderLevel();
	}
	updateGame();
}
