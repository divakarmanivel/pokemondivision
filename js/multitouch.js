function multiTouch(){
//touch listeners
document.addEventListener('touchstart', process_touchstart, false); 
document.addEventListener('touchmove', process_touchmove, false); 
document.addEventListener('touchcancel', process_touchcancel, false); 
document.addEventListener('touchend', process_touchend, false);
var startTouchX;
var startTouchY;
var touches;

function process_touchstart(ev) 
{	
	console.log("touchstart");
	startTouchX=ev.changedTouches[0].clientX;
	startTouchY=ev.changedTouches[0].clientY;
	touches=ev.touches;
	return; 
}

function process_touchend(ev) 
{ 
	console.log("touchend");
	touchcontext.clearRect(0,0,touchcanvas.width,touchcanvas.height);
	touches=null;
	sX=0;
	sY=0;
	return;
}	

function process_touchmove(ev) 
{ 
	ev.preventDefault();
	console.log("touchmove");
	touches=ev.touches;
	return;
}	

function process_touchcancel(ev) 
{ 
	console.log("touchcancel");
	touchcontext.clearRect(0,0,touchcanvas.width,touchcanvas.height);
	touches=null;
	sX=0;
	sY=0;
	return;
}	

function updateTouch() {
touchcontext.clearRect(0,0,touchcanvas.width,touchcanvas.height);
	if (touches && touches.length) {
		for(var i = 0; i< touches.length; i++){
		mx = touches[i].clientX - startTouchX;
  		my = touches[i].clientY - startTouchY;
  		angle = Math.round(Math.atan2(my,mx)*180/Math.PI);
		if(angle>0){
			if(angle>0&&angle<45){
				console.log("right");
				sX=1
				sY=0;
			}
			else if(angle>45&&angle<135){
				console.log("down");
				sY=1;
				sX=0;
			}
			else if(angle>135&&angle<180){
				console.log("left");
				sX=-1;
				sY=0;
			}
		} else if(angle<0){
			angle = Math.abs(angle);
			if(angle>0&&angle<45){
				console.log("right");
				sX=1;
				sY=0;
			}
			else if(angle>45&&angle<135){
				console.log("up");
				sY=-1;
				sX=0;
			}
			else if(angle>135&&angle<180){
				console.log("left");
				sX=-1;
				sY=0;
			}
		}
		touchcontext.beginPath(); 
		touchcontext.strokeStyle = "cyan"; 
		touchcontext.lineWidth = 2; 
		touchcontext.arc(startTouchX,startTouchY,60,0,Math.PI*2,true); 
		touchcontext.stroke();
		touchcontext.beginPath(); 
		touchcontext.strokeStyle = "cyan"; 
		touchcontext.arc(touches[i].clientX,touches[i].clientY,40,0,Math.PI*2,true); 
		touchcontext.stroke();
		}
	}
	window.requestAnimationFrame(updateTouch);
}
updateTouch();

// keyboard listeners
document.addEventListener("keydown", function(e){
console.log(e.keyCode);
	switch(e.keyCode){
		case 65:
			console.log("left");
				sX=-1;
				break;
		case 87:
			console.log("up");
				sY=-1;
				break;
		case 68:
			console.log("right");
				sX=1;
				break;
		case 83:
			console.log("down");
				sY=1;
				break;
	}
}, false);
 
document.addEventListener("keyup", function(e){
	switch(e.keyCode){
		case 65:
			sX=0;
			break;
	case 87:
			sY=0;
			break;
	case 68:
			sX=0;
			break;
	case 83:
			sY=0;
			break;
	}
	}, false);
}
