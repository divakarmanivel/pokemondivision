function collisionCheck(){
	// check for collisions
	var baseCol = Math.round(playerXPos/tileSize);
	var baseRow = Math.round(playerYPos/tileSize);
	var left=baseCol-1;
	var right=baseCol+1;
	var top=baseRow-1;
	var bottom=baseRow+1;
	var collision=false;

	if(sX<0&&level[baseRow][left]!=0){
		collision=true;
	} else if(sX>0&&level[baseRow][right]!=0){
		collision=true;
	} else if(sY<0&&level[top][baseCol]!=0){
		collision=true;
	} else if(sY>0&&level[bottom][baseCol]!=0){
		collision=true;
	}
	return collision;
}
