// render menu
function renderMenu() {
    if (!loading && showMenu) {
        menucontext.save();
        // shadows
        menucontext.shadowColor = shadow_color;
        menucontext.shadowBlur = shadow_blur;
        menucontext.shadowOffsetX = shadow_offset;
        menucontext.shadowOffsetY = shadow_offset;
        // draw menu
        menucontext.fillStyle = bg_color;
        menucontext.fillRect(0, 0, menucanvas.width, menucanvas.height);
        // menu item 1
        drawMenuItem(0, "PokeDex");
        // menu item 2
        drawMenuItem(1, "Bag");
        // menu item 3
        drawMenuItem(2, "Settings");
        menucontext.restore();
    }
}

function drawMenuItem(id, text) {
    var diff = 60 * id;
    menucontext.fillStyle = bg_dark_color;
    menucontext.fillRect(10, controls_start.height + (20 + diff), menucanvas.width - 20, 50);
    menucontext.fillStyle = fg_color;
    menucontext.font = "20px sans-serif";
    menucontext.fillText(text, 20, controls_start.height + (50 + diff));
}

// update the menu
function updateMenu() {
    window.requestAnimationFrame(updateMenu);
    // rendering menu
    renderMenu();
}