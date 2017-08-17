function renderer(){
	/*
	var characterRow=1;
	var frameIndex=0;
	var tickCount=0;
	var ticksPerFrame=0;
	var numberOfFrames=3;
	*/

	var characterRow=2;
	var frameIndex=0;
	var tickCount=0;
	var ticksPerFrame=0;
	var numberOfFrames=9;
	// render the level
	function renderLevel(){
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
						var sourceX=(tile-1)*tileSize;
						var sourceY=0;
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
						var sourceX=(tile-1)*tileSize;
						var sourceY=0;
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
		}
		
		// render player
		/*
		var sw=(frameIndex*tileSize)+frameIndex+1;
		var sh=(characterRow*tileSize)+characterRow+1;
		var w = Math.round(camWidth/(2*tileSize))*tileSize;
		var h = Math.round(camHeight/(2*tileSize))*tileSize;
		*/
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
	
	// function to handle the game itself

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

};
    
