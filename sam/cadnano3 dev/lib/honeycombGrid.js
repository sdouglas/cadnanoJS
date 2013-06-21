var mode = undefined;
function initHoneycombGrid() {
    if(mode === undefined) {
        width = 32;
        height = 30;
        honeycombGrid(width,height);
        mode = "honeycomb";
    }
    else {
        alert("Use \"new\" to create a new grid!");
    }
}

function honeycombGrid(xGrid,yGrid) {
    // Note: check squareGrid.html for more detailed commentary -->
    
    var rt3 = Math.sqrt(3);
    //parameters
    var r = 11;
    var xg = xGrid;
    var yg = yGrid;
    //commonly used global vars
    var chosen = new SliceStack();
    var grid = new Array();
    for(var i=0; i<xg; i++) {
	grid[i] = new Array();
    }
    //setting up window
    var panel = document.getElementsByClassName("sliceView")[0];
    var windowsize = {width: 10+2*xg*r, height: 10+r+3*yg*r};
    var canvas = new Two(windowsize).appendTo(panel);
    
    //grid construction
    for(var j=0; j<yg; j++) {
	for(var i=0; i<xg; i++) {
	    var centerx = 5+r+rt3*i*r;
	    var centery = 5+r+3*j*r;
	    if((i+j)%2 === 1) {
		centery += r;
	    }
	    var circle = canvas.makeCircle(centerx,centery,r);
	    circle.stroke = "#808080";
	    circle.fill = "#F0F0F0";
	    circle.lineWidth = 1;
	    grid[i][j] = circle;
	}
    }
    
    //initial image
    canvas.update();
    
    //highlight the circle mouse is pointing at
    function inCircle(xPos,yPos) {
	var result = new Array();
	var xLeft = Math.floor((xPos-50-r+panel.scrollLeft)/(rt3*r));
	var xRight = Math.ceil((xPos-50-r+panel.scrollLeft)/(rt3*r));
	var y = Math.floor((yPos-58+panel.scrollTop)/(3*r));
	var centerxLeft = 5+r+rt3*xLeft*r;
	var centeryLeft = 5+r+3*y*r;
	if((xLeft+y)%2 === 1) {
	    centeryLeft += r;
	}
	var distLeft = Math.sqrt((xPos+panel.scrollLeft-centerxLeft-50)*(xPos+panel.scrollLeft-centerxLeft-50)+(yPos+panel.scrollTop-centeryLeft-58)*(yPos+panel.scrollTop-centeryLeft-58));
	var centerxRight = 5+r+rt3*xRight*r;
	var centeryRight = 5+r+3*y*r;
	if((xRight+y)%2 === 1) {
	    centeryRight += r;
	}
	var distRight = Math.sqrt((xPos+panel.scrollLeft-centerxRight-50)*(xPos+panel.scrollLeft-centerxRight-50)+(yPos+panel.scrollTop-centeryRight-58)*(yPos+panel.scrollTop-centeryRight-58));
	if(distLeft <= r) {
	    result[0] = xLeft;
	    result[1] = y;
	}
	else if(distRight <= r) {
	    result[0] = xRight;
	    result[1] = y;
	}
	else {
	    result[0] = -1;
	    result[1] = -1;
	}
	return result;
    }
    
    var px = 0;
    var py = 0;
    panel.onmousemove = handlerMM;
    function handlerMM(e) {
	if(px>=0 && px<xg && py>=0 && py<yg) {
	    grid[px][py].fill = "#F0F0F0";
	}
	var x = inCircle(e.pageX,e.pageY)[0];
	var y = inCircle(e.pageX,e.pageY)[1];
	if(x>=0 && x<xg && y>=0 && y<yg) {
	    grid[x][y].fill = "#33CCFF";
	}
	for(var i=0; i<chosen.stack.length; i++) {
	    grid[chosen.stack[i][0]][chosen.stack[i][1]].fill = "#FFFFCC";
	}
	px = x;
	py = y;
	canvas.update();
    }
    
    //edit the clicked list
    panel.onclick = handlerMC;
    function handlerMC(e) {
	var x = inCircle(e.pageX,e.pageY)[0];
	var y = inCircle(e.pageX,e.pageY)[1];
	if(x>=0 && x<xg && y>=0 && y<yg && chosen.contains(x,y) === -1) {
	    chosen.add(x,y);
	    grid[x][y].fill = "#FFFFCC";
	    canvas.update();
	    chosen.undostack = new Array();
	}
    }
    
    //undo and redo
    function undo() {
	if(chosen.stack.length !== 0) {
	    grid[chosen.stack[chosen.stack.length-1][0]][chosen.stack[chosen.stack.length-1][1]].fill = "#F0F0F0";
	}
	chosen.undo();
	canvas.update();
    }
    function redo() {
	chosen.redo();
	grid[chosen.stack[chosen.stack.length-1][0]][chosen.stack[chosen.stack.length-1][1]].fill = "#FFFFCC";
	canvas.update();
    }
}