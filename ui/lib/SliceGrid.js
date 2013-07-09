function initGrid(xg, yg, mode, p) { //avoids multiple instantiation of panels
    if(gridMode === undefined) {
	SliceGrid(xg, yg, mode, p);
	gridMode = mode;
    }
    else {
	alert("Use \"New\" to make a different grid!");
    }
}

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
    var scafFill = "#FFB366";
    //layers and groups
    var emptyLayer = new Kinetic.Layer(); //bottom layer just for background
    var hoverLayer = new Kinetic.Layer(); //layer of circles triggered by mouseover functions
    var activeLayer = new Kinetic.Layer(); //layer of active helixes (clicked by mouse)
    var scafLayer = new Kinetic.Layer(); //activated by clicking active helixes again, creates strand
    var textLayer = new Kinetic.Layer(); //layer for all text created by activeLayer and scafLayer
    var emptyGroup = new Kinetic.Group(); //every layer has a corresponding group for easy modification
    emptyLayer.add(emptyGroup);
    var hoverGroup = new Kinetic.Group(); //hoverGroup exists purely for uniformity as the group has only one shape
    hoverLayer.add(hoverGroup);
    var activeGroup = new Kinetic.Group();
    activeLayer.add(activeGroup);
    var scafGroup = new Kinetic.Group();
    scafLayer.add(scafGroup);
    var textGroup = new Kinetic.Group();
    textLayer.add(textGroup);
    //window properties
    var zoomfactor = 1;
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
    //link a VirtualHelixSet to path panel
    vhis = new UI_VirtualHelixSet(pp,mode,20);
    //setup
    var panel = document.getElementById(p); //dynamic canvas location. screws up inCircle function though so it's pretty useless.
    var canvasSettings = {container: p, width: windowWidth, height: windowHeight};
    var canvas = new Kinetic.Stage(canvasSettings);
    canvas.add(emptyLayer);
    canvas.add(hoverLayer);
    canvas.add(activeLayer);
    canvas.add(scafLayer);
    canvas.add(textLayer);
    var activeHelices = new SliceStack();
    var scafHelices = new SliceStack();
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
	    emptyGroup.add(circle);
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
	    var xLeft = Math.floor((xPos-45-2*r*zoomfactor+panel.scrollLeft)/(1.732*r*zoomfactor));
	    var xRight = Math.ceil((xPos-45-2*r*zoomfactor+panel.scrollLeft)/(1.732*r*zoomfactor));
	    var y = Math.floor((yPos-54-r*zoomfactor+panel.scrollTop)/(3*r*zoomfactor));
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
		centerXL = circleCenters[xLeft][y][0]*zoomfactor;
		centerYL = circleCenters[xLeft][y][1]*zoomfactor;
		distL = dist(xPos-45+panel.scrollLeft,yPos-54+panel.scrollTop,centerXL,centerYL);
	    }
	    else {distL = 2*r*zoomfactor;} //this distL allows us to skip the (distL <= r*zf) conditional
	    var centerXR = 0;
	    var centerYR = 0;
	    //right circle
	    var distR = 0;
	    if(xRight < gridWidth) {
		centerXR = circleCenters[xRight][y][0]*zoomfactor;
		centerYR = circleCenters[xRight][y][1]*zoomfactor;
		distR = dist(xPos-45+panel.scrollLeft,yPos-54+panel.scrollTop,centerXR,centerYR);
	    }
	    else {distR = 2*r*zoomfactor;}
	    //checking distance from center
	    if(distL <= r*zoomfactor) { //we do not need to compare distL to distR because they cannot both be <= r*zf (or else there should be circle overlap)
		result[0] = xLeft;
		result[1] = y;
	    }
	    else if(distR <= r*zoomfactor) {
		result[0] = xRight;
		result[1] = y;
	    }
	    else {
		result[0] = -1;
		result[1] = -1;
	    }
	}
	else { //square mode - this part of search function is rather straightforward
	    var x = Math.floor((xPos-45-r*zoomfactor+panel.scrollLeft)/(2*r*zoomfactor));
	    var y = Math.floor((yPos-54-r*zoomfactor+panel.scrollTop)/(2*r*zoomfactor));
	    if(x < 0 || x >= gridWidth || y < 0 || y>= gridHeight) { //outside array boundary, return [-1,-1]
		result[0] = -1;
		result[1] = -1;
		return result;
	    }
	    var centerX = circleCenters[x][y][0]*zoomfactor;
	    var centerY = circleCenters[x][y][1]*zoomfactor;
	    if(dist(xPos-45+panel.scrollLeft,yPos-54+panel.scrollTop,centerX,centerY) <= r*zoomfactor) {
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
	hoverGroup.removeChildren(); //clear the group and redraw the current hovering helix
	var cx = inCircle(e.pageX,e.pageY)[0];
	var cy = inCircle(e.pageX,e.pageY)[1];
	if(cx != -1 && cy != -1) { //the if statement checks if the mouse is hovering on a helix
	    var circle = new Kinetic.Circle({
		    radius:r,
		    x: circleCenters[cx][cy][0],
		    y: circleCenters[cx][cy][1],
		    fill: hoverFill,
		    stroke: circStroke,
		    strokeWidth: 1
		});
	    hoverGroup.add(circle);
	}
	hoverLayer.draw();
    }

    //active layer and scaf layer
    panel.onclick = mchandle;
    function mchandle(e)
    {
	var cx = inCircle(e.pageX,e.pageY)[0];
	var cy = inCircle(e.pageX,e.pageY)[1];
	if(cx != -1 && cy != -1) {
	    if(activeHelices.contains(cx,cy) === -1) { //mouse is on an unclicked helix
		activeHelices.add(cx,cy);
		//circle
		var circle = new Kinetic.Circle({
			radius:r,
			x: circleCenters[cx][cy][0],
			y: circleCenters[cx][cy][1],
			fill: activeFill,
			stroke: circStroke,
			strokeWidth: 1,
			id: "activecirc."+cx+"."+cy
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
			align: "CENTER",
			id: "activecirctext."+cx+"."+cy
		    });
		helixNumText.setOffset({
			x: helixNumText.getWidth()/2
		    });
		//adding shapes to group
		activeGroup.add(circle);
		textGroup.add(helixNumText);
		activeLayer.draw();
		textLayer.draw();
		//add a VirtualHelixItem in path panel
		vhis.addVHI();
	    }
	    else if(scafHelices.contains(cx,cy) === -1) { //mouse is on active helix: scaf layer
		scafHelices.add(cx,cy);
		//circle
		var circle = new Kinetic.Circle({
			radius:r,
			x: circleCenters[cx][cy][0],
			y: circleCenters[cx][cy][1],
			fill: scafFill,
			stroke: circStroke,
			strokeWidth: 1,
		    });
		scafGroup.add(circle);
		scafLayer.draw();
		//add a strand in path panel
		var counter = vhis.slidebar.getCounter();
		var helixnum = activeHelices.contains(cx,cy);
		var vhi = vhis.vhiArray[helixnum];
		function counterLimit(n) {return Math.max(0,Math.min(n,vhis.grLength-1));}
		if(helixnum%2 == 0) {
		    var epi1 = new UI_EndpointItem(vhi,counterLimit(counter-1),0,5);
                    var epi2 = new UI_EndpointItem(vhi,counterLimit(counter+1),0,3);
                    var strand = new UI_StrandItem(epi1,epi2);
		}
		else {
		    var epi1 = new UI_EndpointItem(vhi,counterLimit(counter+1),1,5);
                    var epi2 = new UI_EndpointItem(vhi,counterLimit(counter-1),1,3);
                    var strand = new UI_StrandItem(epi1,epi2);
		}
	    }
	    //you can (not) redo!Q
	    activeHelices.undostack = new Array();
	}
    }

    //zoom with wheel
    panel.onmousewheel = mwhandle;
    function mwhandle(e) {
	    zoomfactor += e.wheelDelta*0.0004;
	    zoomfactor = Math.min(Math.max(zoomfactor,0.5),5);
	    if(mode === "honeycomb") {
		canvas.setSize(zoomfactor*(2*r+1.732*gridWidth*r),zoomfactor*(2*r+3*gridHeight*r));
		//things would be easier if we can store previous zf as we can use getWidth() and getHeight()...
	    }
	    else {
		canvas.setSize(zoomfactor*(2*r+2*gridWidth*r),zoomfactor*(2*r+2*gridHeight*r));
	    }
	    emptyGroup.setScale(zoomfactor);
	    hoverGroup.setScale(zoomfactor);
	    activeGroup.setScale(zoomfactor);
	    scafGroup.setScale(zoomfactor);
	    textGroup.setScale(zoomfactor);
	    emptyLayer.draw();
	    hoverLayer.draw();
	    activeLayer.draw();
	    scafLayer.draw();
	    textLayer.draw();
    }

    /* 
       Note: undo function will no longer be updated as it will be replaced in near future.
       Only works for undoing active helices.

     //Kinetic.js does not support keyboard event; this event triggers only when mouse is inside panel when a key is pressed
    panel.onmouseover = function() {
	document.onkeypress = function(e) {
	    if(e.keyCode === 90 || e.keyCode === 122) { //button: Z/z
		undo();
	    }
	};
    };

    function undo() {
	if(activeHelices.stack.length !== 0) {
	    var carray = activeHelices.stack[activeHelices.stack.length-1];
	    var cx = carray[0];
	    var cy = carray[1];
	    textGroup.get("#activecirctext."+cx+"."+cy).remove();
	    activeGroup.get("#activecirc."+cx+"."+cy).remove();
	}
	activeHelices.undo();
	activeLayer.draw();
	textLayer.draw();
	vhis.removeVHI();
    }
    //I feel that a redo function isn't really needed
    */
}
