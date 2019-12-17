// render interactions
function renderInteraction() {
    if(!loading && showInteraction) {
        var x = interactioncanvas.width / 2;
        var y = interactioncanvas.height / 2;
        interactioncontext.save();
        // shadows
        interactioncontext.shadowColor = shadow_color;
        interactioncontext.shadowBlur = shadow_blur;
        interactioncontext.shadowOffsetX = shadow_offset;
        interactioncontext.shadowOffsetY = shadow_offset;
        // border
        interactioncontext.fillStyle = bg_color;
        interactioncontext.fillRect(x - 300, y - 100, 600, 200);
        // info box
        interactioncontext.fillStyle = bg_color;
        interactioncontext.fillRect(x - 300, y - 130, 180, 40);
        interactioncontext.fillStyle = fg_color;
        interactioncontext.font = "16px sans-serif";
        interactioncontext.fillText(interactionTitle, x - 290, y - 110);
        // close info
        interactioncontext.fillStyle = bg_color;
        interactioncontext.fillRect(x + 210, y + 90, 90, 40);
        interactioncontext.fillStyle = fg_color;
        interactioncontext.font = "16px sans-serif";
        interactioncontext.fillText("Press B", x + 230, y + 120);
        // content text
        interactioncontext.fillStyle = fg_color;
        interactioncontext.font = "20px sans-serif";
        interactioncontext.fillText(interactionText, x - 290, y - 60);
        // hide overlapping shadows
        interactioncontext.shadowBlur = 0;
        interactioncontext.shadowOffsetX = 0;
        interactioncontext.shadowOffsetY = 0;
        interactioncontext.fillStyle = bg_color;
        interactioncontext.fillRect(x - 300, y - 100, 180, 20);
        interactioncontext.fillRect(x + 210, y + 70, 90, 20);
        interactioncontext.restore();
    }
}

// update the interactions
function updateInteractions() {
    window.requestAnimationFrame(updateInteractions);
    // rendering interactions
    renderInteraction();
}