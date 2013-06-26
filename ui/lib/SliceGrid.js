function SliceGrid(xg, yg, mode) {
    //grid properties
    var gridWidth = xg;
    var gridHeight = yg;
    //circle properties
    var r = 12;
    var circStroke = "#808080";
    var emptyFill = "#F0F0F0";
    var hoverFill = "#33CCFF";
    var activeFill = "#FFE400";
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
    else {
	alert("Grid type does not exist, script aborted.");
	throw "stop execution";
    }
    //setup
    var canvasSettings = {container: "sliceView", width: windowWidth, height: windowHeight};
    var canvas = new Kinetic.Stage(canvasSettings);
    var textLayer = new Kinetic.Layer();
    var shapeLayer = new Kinetic.Layer();
    var activeHelixes = new SliceStack();
    var sliceGrid = new Array();
    //grid construction
    for(var i=0; i<gridWidth; i++) {
	sliceGrid[i] = new Array();
        for(var j=0; j<gridHeight; j++) {
	    var centerX;
	    var centerY;
	    if(mode === "honeycomb") {
		centerX = 2*r+1.732*i*r;
		centerY = 2*r+3*j*r;
		if((i+j)%2 === 1) {
		    centerY += r;
		}
	    }
	    else {
		centerX = 2*r+2*i*r;
		centerY = 2*r+2*j*r;
	    }
	    var circle = new Kinetic.Circle({
		    radius: r,
		    x: centerX,
		    y: centerY,
		    fill: emptyFill,
		    stroke: circStroke,
		    strokeWidth: 1
	    });
	    shapeLayer.add(circle);
            circle.on("mouseover", function() {
		    if(activeHelixes.contains(this.getX(),this.getY()) === -1) {
			this.setFill(hoverFill);
			shapeLayer.draw();
		    }
	    });
            circle.on("mouseout", function() {
		    if(activeHelixes.contains(this.getX(),this.getY()) === -1) {
			this.setFill(emptyFill);
			shapeLayer.draw();
		    }
	    });
	    circle.on("click", function() {
		    if(activeHelixes.contains(this.getX(),this.getY()) === -1) {
			activeHelixes.add(this.getX(),this.getY());
			this.setFill(activeFill);
			//number on the circle
			var helixNum = activeHelixes.stack.length-1;
			var textX;
			if(helixNum < 10) {textX = this.getX()-r/4;}
			else if(helixNum < 100) {textX = this.getX()-r/2;}
			else {textX = this.getX()-r*3/4;}
			var textY = this.getY()-r/2;
			var helixNumText = new Kinetic.Text({
				x: textX,
				y: textY,
				text: helixNum,
				fontSize: 12,
				fontFamily: "Calibri",
				fill: "#000000",
				align: "CENTER"
			});
			//end: number on the circle
			textLayer.add(helixNumText);
			shapeLayer.draw();
			textLayer.draw();
		    }
	    });
	}
    }
    canvas.add(shapeLayer);
    canvas.add(textLayer);
}