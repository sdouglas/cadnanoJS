function SliceGrid(xg, yg, mode, p) {
    //grid properties
    var gridWidth = xg;
    var gridHeight = yg;
    //circle properties
    var r = 12;
    var circStroke = "#808080";
    var emptyFill = "#F0F0F0";
    var hoverFill = "#33CCFF";
    var activeFill = "#FFE400";
    //layers
    var emptyLayer = new Kinetic.Layer(); //bottom layer just for background
    var hoverLayer = new Kinetic.Layer(); //layer of circles triggered by mouseover functions
    var activeLayer = new Kinetic.Layer(); //layer of active helixes (clicked by mouse)
    //window properties
    var windowWidth;
    var windowHeight;
    if(mode === "honeycomb") {
	windowWidth = 2*r+1.732*gridWidth*r;
	windowHeight = 2*r+3*gridHeight*r;
    }
    else if(mode === "square") {
	windowWidth = 2*r+2*gridWidth*r;
	windowHeight = 2*r+2*gridHeight*r;
    }
    else { //make sure you don't have any typos!
	alert("Grid type does not exist, script aborted.");
	throw "stop execution";
    }
    //setup
    var panel = document.getElementById(p); //dynamic canvas location makes the view more flexible in terms of its location in browser (not really since a few numbers in inCircle still needs to be changed)
    var canvasSettings = {container: p, width: windowWidth, height: windowHeight};
    var canvas = new Kinetic.Stage(canvasSettings);
    canvas.add(emptyLayer);
    canvas.add(hoverLayer);
    canvas.add(activeLayer);
    var activeHelices = new SliceStack();
    var circleCenters = new Array(); //3D array that stores center of circles; comes in handy later
    //grid construction
    for(var i=0; i<gridWidth; i++) {
	circleCenters[i] = new Array();
	//getting center for circles
        for(var j=0; j<gridHeight; j++) {
	    circleCenters[i][j] = new Array();
	    if(mode === "honeycomb") {
	    /*
	      In honeycomb grid, horizontal lines are not straight- they look like this
	      line 1 -> -_-_-_-
	      line 2 -> _-_-_-_
	      While it is easier to create circle from given grid position, searching for the circle corresponding to given coords is harder.
	    */
		circleCenters[i][j][0] = 2*r+1.732*i*r;
		circleCenters[i][j][1] = 2*r+3*j*r;
		if((i+j)%2 === 1) {
		    circleCenters[i][j][1] += r;
		}
	    }
	    else { //square mode
		circleCenters[i][j][0] = 2*r+2*i*r;
		circleCenters[i][j][1] = 2*r+2*j*r;
	    }
	    //actually making the circle
	    var circle = new Kinetic.Circle({
		    radius: r,
		    x: circleCenters[i][j][0],
		    y: circleCenters[i][j][1],
		    fill: emptyFill,
		    stroke: circStroke,
		    strokeWidth: 1
		});
	    emptyLayer.add(circle);
	}
	emptyLayer.draw();
    }

    //distance function used in inCircle
    function dist(x1,y1,x2,y2) {
	return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    }
    //inCircle function returns the cirlce mouse is hovering on as a 2D array ([-1,-1] if mouse is not hovering on any circle)
    function inCircle(xPos,yPos) {
	var result = new Array();
	if(mode === "honeycomb") {
	    /*
	      How this function works:
	      Row is easy to determine, but column is not because of the overalapping horizontal region.
	      The two circles closest to the given coords is found and their distance to the given coords is calculated.
	      Then we just take the circle with distance less than r (if it exists).
	    */
	    var xLeft = Math.floor((xPos-45-2*r+panel.scrollLeft)/(1.732*r));
	    var xRight = Math.ceil((xPos-45-2*r+panel.scrollLeft)/(1.732*r));
	    var y = Math.floor((yPos-54-r+panel.scrollTop)/(3*r));
	    if(xRight < 0 || xLeft >= gridWidth || y < 0 || y>= gridHeight) { //outside array boundary, return [-1,-1]
		result[0] = -1;
		result[1] = -1;
		return result;
	    }
	    //left circle
	    var centerXL = 0;
	    var centerYL = 0;
	    var distL = 0;
	    if(xLeft >= 0) { //avoids the case when xLeft = -1 but xRight = 0
		centerXL = circleCenters[xLeft][y][0];
		centerYL = circleCenters[xLeft][y][1];
		distL = dist(xPos-45+panel.scrollLeft,yPos-54+panel.scrollTop,centerXL,centerYL);
	    }
	    else {distL = 2*r;} //this distL allows us to skip the (distL <= r) conditional
	    var centerXR = 0;
	    var centerYR = 0;
	    //right circle
	    var distR = 0;
	    if(xRight < gridWidth) {
		centerXR = circleCenters[xRight][y][0];
		centerYR = circleCenters[xRight][y][1];
		distR = dist(xPos-45+panel.scrollLeft,yPos-54+panel.scrollTop,centerXR,centerYR);
	    }
	    else {distR = 2*r;}
	    //checking distance from center
	    if(distL <= r) { //we do not need to compare distL to distR because they cannot both be <= r (or else there should be circle overlap)
		result[0] = xLeft;
		result[1] = y;
	    }
	    else if(distR <= r) {
		result[0] = xRight;
		result[1] = y;
	    }
	    else {
		result[0] = -1;
		result[1] = -1;
	    }
	}
	else { //square mode - this part of search function is rather straightforward
	    var x = Math.floor((xPos-45-r+panel.scrollLeft)/(2*r));
	    var y = Math.floor((yPos-54-r+panel.scrollTop)/(2*r));
	    if(xRight < 0 || x >= gridWidth || y < 0 || y>= gridHeight) { //outside array boundary, return [-1,-1]
		result[0] = -1;
		result[1] = -1;
		return result;
	    }
	    var centerX = circleCenters[x][y][0];
	    var centerY = circleCenters[x][y][1];
	    if(dist(xPos-45+panel.scrollLeft,yPos-54+panel.scrollTop,centerX,centerY) <= r) {
		result[0] = x;
		result[1] = y;
	    }
	    else {
		result[0] = -1;
		result[1] = -1;
	    }
	}
	return result;
    }

    //hover layer
    panel.onmousemove = mmhandle;
    function mmhandle(e) {
	hoverLayer.removeChildren(); //clear the layer and redraw the current hovering helix
	var cx = inCircle(e.pageX,e.pageY)[0];
	var cy = inCircle(e.pageX,e.pageY)[1];
	if(cx != -1 && cy != -1) {//the if statement checks if the mouse is hovering on a helix
	    var circle = new Kinetic.Circle({
		    radius:r,
		    x: circleCenters[cx][cy][0],
		    y: circleCenters[cx][cy][1],
		    fill: hoverFill,
		    stroke: circStroke,
		    strokeWidth: 1
		});
	    hoverLayer.add(circle);
	}
	hoverLayer.draw();
    }

    //active layer
    panel.onclick = mchandle;
    function mchandle(e)
    {
	var cx = inCircle(e.pageX,e.pageY)[0];
	var cy = inCircle(e.pageX,e.pageY)[1];
	if(cx != -1 && cy != -1 && activeHelices.contains(cx,cy) === -1) { //making sure mouse is on an unclicked helix
	    activeHelices.add(cx,cy);
	    //circle	    
	    var circle = new Kinetic.Circle({
		    radius:r,
		    x: circleCenters[cx][cy][0],
		    y: circleCenters[cx][cy][1],
		    fill: activeFill,
		    stroke: circStroke,
		    strokeWidth: 1
		});
	    //number on the circle                                                                                             
	    var helixNum = activeHelices.stack.length-1;
	    var helixNumText = new Kinetic.Text({
		    x: circle.getX(),
		    y: circle.getY()-r/2,
		    text: helixNum,
		    fontSize: 12,
		    fontFamily: "Calibri",
		    fill: "#000000",
		    align: "CENTER"
		});
	    helixNumText.setOffset({
		    x: helixNumText.getWidth()/2
			});
	    //adding shapes to layer
	    activeLayer.add(circle);
	    activeLayer.add(helixNumText);
	    activeLayer.draw();
	    //You can (not) redo
	    activeHelices.undostack = new Array();
	}
    }
}
