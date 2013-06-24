var mode = undefined;
function initSquareGrid() {
    if(mode === undefined) {
	width = 40;
	height = 40;
	squareGrid(width,height);
	mode = "square";
    }
    else {
        alert("Use \"new\" to create a new grid!");
    }
}

function squareGrid(xGrid,yGrid) {
    //parameters
    var r = 11; //radius
    var xg = xGrid; //# of horizontal circles
    var yg = yGrid; //# of vertical circles
    
    //commonly-used global vars
    var chosen = new SliceStack(); //list of clicked circles
    var grid = new Array(); //grid of circles
    for(var i=0; i<xg; i++) { //setting up 2D array
	grid[i] = new Array();
    }

    //setting up the window
    var panel = document.getElementsByClassName("sliceView")[0];
    var windowsize = {width: 10+2*xg*r, height: 10+r+2*yg*r};
    var canvas = new Two(windowsize).appendTo(panel);
    
    //construct a 2D grid of circles
    for(var i=0; i<xg; i++) {
	for(var j=0; j<yg; j++) {
	    var circle = canvas.makeCircle(5+r+2*i*r,5+r+2*j*r,r);
	    circle.stroke = "#808080";
	    circle.fill = "#F0F0F0";
	    circle.lineWidth = 1;
	    grid[i][j] = circle;
	}
    }
    
    //initial image
    canvas.update();
    
    //highlight the circle mouse is pointing at
    var px = 0;
    var py = 0;
    panel.onmousemove = handlerMM;
    function handlerMM(e) {
	//the extra is due to webpage margin and icons
	var x = Math.floor((e.pageX-50+panel.scrollLeft)/(2*r));
	var y = Math.floor((e.pageY-58+panel.scrollTop)/(2*r));
	//reset color of previous circle
	if(px>=0 && px<xg && py>=0 && py<yg) {
	    grid[px][py].fill = "#F0F0F0";
	}
	//color target circle
	if(x>=0 && x<xg && y>=0 && y<yg && Math.sqrt((2*r*x+50+r-e.pageX-panel.scrollLeft)*(2*r*x+50+r-e.pageX-panel.scrollLeft)+(2*r*y+58+r-e.pageY-panel.scrollTop)*(2*r*y+58+r-e.pageY-panel.scrollTop))<=r) {
	    grid[x][y].fill = "#33CCFF";
	}
	//color the clicked circles
	for(var i=0; i<chosen.stack.length; i++) {
	    grid[chosen.stack[i][0]][chosen.stack[i][1]].fill = "#FFFFCC";
	}
	//update previous location
	px = x;
	py = y;
	canvas.update();
    }
    
    // edit the "chosen" list when mouse is clicked
    panel.onclick = handlerMC;
    function handlerMC(e) {
	var x = Math.floor((e.pageX-50+panel.scrollLeft)/(2*r));
	var y = Math.floor((e.pageY-58+panel.scrollTop)/(2*r));
	if(x>=0 && x<xg && y>=0 && y<yg && chosen.contains(x,y) === -1) {
	    chosen.add(x,y);
	    grid[x][y].fill = "#FFFFCC";
	    canvas.update();
	    //cannot redo after new actions
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