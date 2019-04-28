function multiTouch() {
	var mouse;
	var startTouchX;
	var startTouchY;
	var touches = [];

	//touch listeners
	document.addEventListener('touchstart', process_touchstart, false);
	document.addEventListener('touchmove', process_touchmove, false);
	document.addEventListener('touchcancel', process_touchcancel, false);
	document.addEventListener('touchend', process_touchend, false);
	document.addEventListener("mousedown", process_mousestart, false);
	document.addEventListener("mousemove", process_mousemove, false);
	document.addEventListener("mouseup", process_mouseend, false);

	// keyboard listeners
	document.addEventListener("keydown", function (e) {
		switch (e.keyCode) {
			case 65: // A
				console.log("left");
				sX = -1;
				break;
			case 87: // W
				console.log("up");
				sY = -1;
				break;
			case 68: // D
				console.log("right");
				sX = 1;
				break;
			case 83: // S
				console.log("down");
				sY = 1;
				break;
			case 37: // D-PAD LEFT
				console.log("left");
				sX = -1;
				break;
			case 38: // D-PAD UP
				console.log("up");
				sY = -1;
				break;
			case 39: // D-PAD RIGHT
				console.log("right");
				sX = 1;
				break;
			case 40: // D-PAD DOWN
				console.log("down");
				sY = 1;
				break;
			case 73: // I
				console.log("a");
				btn_a = 1;
				break;
			case 74: // J
				console.log("b");
				btn_b = 1;
				break;
			case 16: // SHIFT
				console.log("select");
				btn_select = 1;
				break;
			case 13: // ENTER
				console.log("start");
				if (btn_start == 0) {
					btn_start = 1;
					showMap = false;
				} else {
					btn_start = 0;
					showMap = true;
				}
				break;
		}
	}, false);

	document.addEventListener("keyup", function (e) {
		switch (e.keyCode) {
			case 65:
				sX = 0;
				break;
			case 87:
				sY = 0;
				break;
			case 68:
				sX = 0;
				break;
			case 83:
				sY = 0;
				break;
			case 37:
				sX = 0;
				break;
			case 38:
				sY = 0;
				break;
			case 39:
				sX = 0;
				break;
			case 40:
				sY = 0;
				break;
			case 73:
				btn_a = 0;
				break;
			case 74:
				btn_b = 0;
				break;
			case 16:
				btn_select = 0;
				break;
			case 13:
				break;
		}
	}, false);

	// process touch inputs
	function process_touchstart(ev) {
		startTouchX = ev.changedTouches[0].clientX;
		startTouchY = ev.changedTouches[0].clientY;
		handle_input(startTouchX, startTouchY, function () {
			touches = ev.touches;
		});
		return;
	}

	function process_touchend(ev) {
		touchcontext.clearRect(0, 0, touchcanvas.width, touchcanvas.height);
		touches = null;
		sX = 0;
		sY = 0;
		btn_a = 0;
		btn_b = 0;
		btn_select = 0;
		return;
	}

	function process_touchmove(ev) {
		ev.preventDefault();
		touches = ev.touches;
		return;
	}

	function process_touchcancel(ev) {
		touchcontext.clearRect(0, 0, touchcanvas.width, touchcanvas.height);
		touches = null;
		sX = 0;
		sY = 0;
		btn_a = 0;
		btn_b = 0;
		btn_start = 0;
		btn_select = 0;
		return;
	}

	// process mouse inputs
	function process_mousestart(ev) {
		startTouchX = ev.clientX;
		startTouchY = ev.clientY;
		handle_input(startTouchX, startTouchY, function () {
			mouse = true;
		});
		return;
	}

	function process_mouseend(ev) {
		mouse = false;
		touchcontext.clearRect(0, 0, touchcanvas.width, touchcanvas.height);
		touches = null;
		sX = 0;
		sY = 0;
		btn_a = 0;
		btn_b = 0;
		btn_select = 0;
		return;
	}

	function process_mousemove(ev) {
		ev.preventDefault();
		if (mouse == true) {
			touches = [];
			var mouses = [];
			mouses.clientX = ev.clientX;
			mouses.clientY = ev.clientY;
			touches.push(mouses);
		}
		return;
	}

	// render the touch panel
	function updateTouch() {
		touchcontext.clearRect(0, 0, touchcanvas.width, touchcanvas.height);

		touchcontext.drawImage(
			controls_start,
			0,
			0,
			controls_start.width,
			controls_start.height,
			10,
			10,
			controls_start.width,
			controls_start.height);

		touchcontext.drawImage(
			controls_select,
			0,
			0,
			controls_select.width,
			controls_select.height,
			touchcanvas.width - controls_select.width - 10,
			10,
			controls_select.width,
			controls_select.height);

		touchcontext.drawImage(
			controls_a,
			0,
			0,
			controls_a.width,
			controls_a.height,
			touchcanvas.width - controls_a.width * 2,
			touchcanvas.height - controls_a.height - 10,
			controls_a.width,
			controls_a.height);

		touchcontext.drawImage(
			controls_b,
			0,
			0,
			controls_b.width,
			controls_b.height,
			touchcanvas.width - controls_a.width - 10,
			touchcanvas.height - controls_a.height * 2,
			controls_b.width,
			controls_b.height);

		if (touches && touches.length) {
			for (var i = 0; i < touches.length; i++) {
				mx = touches[i].clientX - startTouchX;
				my = touches[i].clientY - startTouchY;
				if (Math.abs(mx) > 60 || Math.abs(my) > 60) {
					angle = Math.round(Math.atan2(my, mx) * 180 / Math.PI);
					if (angle > 0) {
						if (angle > 0 && angle < 45) {
							console.log("right");
							sX = 1;
							sY = 0;
						} else if (angle > 45 && angle < 135) {
							console.log("down");
							sY = 1;
							sX = 0;
						} else if (angle > 135 && angle < 180) {
							console.log("left");
							sX = -1;
							sY = 0;
						}
					} else if (angle < 0) {
						angle = Math.abs(angle);
						if (angle > 0 && angle < 45) {
							console.log("right");
							sX = 1;
							sY = 0;
						} else if (angle > 45 && angle < 135) {
							console.log("up");
							sY = -1;
							sX = 0;
						} else if (angle > 135 && angle < 180) {
							console.log("left");
							sX = -1;
							sY = 0;
						}
					}
				} else {
					sX = 0;
					sY = 0;
				}

				touchcontext.drawImage(
					controls_outer,
					0,
					0,
					controls_outer.width,
					controls_outer.height,
					startTouchX - controls_outer.width / 2,
					startTouchY - controls_outer.height / 2,
					controls_outer.width,
					controls_outer.height);
				touchcontext.drawImage(
					controls_inner,
					0,
					0,
					controls_inner.width,
					controls_inner.height,
					touches[i].clientX - controls_inner.width / 2,
					touches[i].clientY - controls_inner.height / 2,
					controls_inner.width,
					controls_inner.height);
			}
		}
		window.requestAnimationFrame(updateTouch);
	}

	// handle inputs
	function handle_input(startTouchX, startTouchY, handle_default) {
		if (startTouchX >= (touchcanvas.width - controls_a.width * 2) &&
			startTouchX <= (touchcanvas.width - controls_a.width * 2 + controls_a.width) &&
			startTouchY >= (touchcanvas.height - controls_a.height - 10) &&
			startTouchY <= (touchcanvas.height - controls_a.height - 10 + controls_a.height)) {
			console.log("a");
			btn_a = 1;
		} else if (startTouchX >= (touchcanvas.width - controls_b.width - 10) &&
			startTouchX <= (touchcanvas.width - controls_b.width - 10 + controls_b.width) &&
			startTouchY >= (touchcanvas.height - controls_b.height * 2) &&
			startTouchY <= (touchcanvas.height - controls_b.height * 2 + controls_b.height)) {
			console.log("b");
			btn_b = 1;
		} else if (startTouchX >= 10 &&
			startTouchX <= (10 + controls_start.width) &&
			startTouchY >= 10 &&
			startTouchY <= (10 + controls_start.height)) {
			console.log("start");
			if (btn_start == 0) {
				btn_start = 1;
				showMap = false;
			} else {
				btn_start = 0;
				showMap = true;
			}
		} else if (startTouchX >= touchcanvas.width - controls_select.width - 10 &&
			startTouchX <= (touchcanvas.width - controls_select.width - 10 + controls_select.width) &&
			startTouchY >= 10 &&
			startTouchY <= (10 + controls_select.height)) {
			console.log("select");
			btn_select = 1;
		} else {
			handle_default();
		}
	}
	updateTouch();
}

// reset all inputs
function reset_inputs() {
	btn_a = 0;
	btn_b = 0;
	btn_start = 0;
	btn_select = 0;
}