
function initMap(numrows, numcols){
   var arr = [];
   for (var i = 0; i < numrows; i++){
      var columns = [];
      for (var j = 0; j < numcols; j++){
         columns[j] = 0;
      }
      arr[i] = columns;
    }

	for (var i = 0; i < arr.length; i++){
		for (var j = 0; j < arr[1].length; j++){
			if(i==0 || j==0 || i==arr.length-1 || j==arr[1].length-1){
				setMap(arr,i,j,1);
			}
    	}
	}

    return arr;
}

function setMap(map,row,col,value) {
	map[row][col]=value;
}
