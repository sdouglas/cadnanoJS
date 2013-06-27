function PathPanelItem(elem) {
    this.canvasSettings = {container: elem, width: 1500, height: 3000};
    this.canvas = new Kinetic.Stage(this.canvasSettings);
}

//This class keeps track of all VHI (virtual helix item) and maintains an uniform standard for VHIs.
function VirtualHelixSet(panel,len,sx,sy) {
    this.canvas = panel.canvas;
    this.sqLength = len;
    this.startX = sx;
    this.startY = sy;
    this.vhiArray = new Array();
    this.slidebar = new PathSlidebar(this);
}
VirtualHelixSet.prototype.addVHI = function() {
    this.vhiArray.push(new VirtualHelixItem(this));
    if(this.vhiArray.length === 1) {
	this.slidebar.init();
    }
    this.slidebar.update();
};

function VirtualHelixItem(vhiSet) {
    this.num = vhiSet.vhiArray.length;
    this.sqLength = vhiSet.sqLength;
    this.startX = vhiSet.startX;
    this.startY = vhiSet.startY + 4*this.num*this.sqLength;
    this.canvas = vhiSet.canvas;
    this.layer = new Kinetic.Layer();
    //lines
    for(var i=0; i<=42; i++) {
	var strokeThickness;
	if(i%7 === 0) {
	    strokeThickness = 4;
	}
	else {
	    strokeThickness = 2;
	}
	var vLine = new Kinetic.Line({
		points: [this.startX+i*this.sqLength, this.startY, this.startX+i*this.sqLength, this.startY+2*this.sqLength],
		stroke: "#DDDDDD",
		strokeWidth: strokeThickness
	    });
	this.layer.add(vLine);
    }
    for(var j=0; j<=2; j++) {
	var hLine = new Kinetic.Line({
		points: [this.startX-2, this.startY+j*this.sqLength, this.startX+42*this.sqLength+2, this.startY+j*this.sqLength],
		stroke: "#DDDDDD",
		strokeWidth: 2
	    });
	this.layer.add(hLine);
    }
    //add layer to canvas
    this.canvas.add(this.layer);
};

function HelixCounterItem(vhi) {
    var layer = new Kinetic.Layer();
    //circle
    var circle = new Kinetic.Circle({
	    radius: vhi.sqLength,
	    x: vhi.startX-3*vhi.sqLength,
	    y: vhi.startY+vhi.sqLength,
	    fill: "#FFE400",
	    stroke: "#808080",
	    strokeWidth: 2
        });
    layer.add(circle);
    circle.on("mouseenter", function() {circle.setStroke("#3333FF"); layer.draw();});
    circle.on("mouseleave", function() {circle.setStroke("#808080"); layer.draw();});
    //number
    var helixNumText = new Kinetic.Text({
	    x: circle.getX(),
	    y: circle.getY()-circle.getRadius()/2,
	    text: vhi.num,
	    fontSize: vhi.sqLength,
	    fontFamily: "Calibri",
	    fill: "#000000",
	});
    helixNumText.setOffset({
	    x: helixNumText.getWidth()/2
	});
    layer.add(helixNumText);
    //bug fix: circle not highlighted when mouse is on text
    helixNumText.on("mouseenter", function() {circle.setStroke("#3333FF"); layer.draw();});
    helixNumText.on("mouseleave", function() {circle.setStroke("#808080"); layer.draw();});
    //add layer to canvas
    vhi.canvas.add(layer);
}

function PathSlidebar(vhis) {
    var counter = 0;
    this.vhiSet = vhis;
    this.layer = new Kinetic.Layer();
    this.rectWidth = this.vhiSet.sqLength;
    this.top = 0;
    this.bot = 0;
    this.rect = new Kinetic.Rect({
	    x: this.vhiSet.startX+counter*this.vhiSet.sqLength,
	    y: -100,
	    width: this.rectWidth,
	    height: this.bot-this.top,
	    fill: "#FFAA80",
	    stroke: "#000000",
	    strokeWidth: 1,
	    opacity: 0.5
	});
    this.counterText = new Kinetic.Text({
	    x: this.vhiSet.startX+(counter+0.5)*this.vhiSet.sqLength,
	    y: -100,
	    text: counter,
	    fontSize: 16,
	    fontFamily: "Calibri",
	    fill: "#000000",
	});
    this.counterText.setOffset({
	    x: this.counterText.getWidth()/2
	});
    var counterText = this.counterText;
    this.group = new Kinetic.Group({
	    draggable: true,
	    dragBoundFunc: function(pos) {
		return {
		    x: counter*vhis.sqLength,
		    y: this.getAbsolutePosition().y
		}
	    }
	});
    this.group.add(this.rect);
    this.group.add(this.counterText);
    this.group.on("dragmove", function(pos) {
	    counter = Math.min(Math.max(0,Math.round((pos.x-vhis.startX)/vhis.sqLength)-1),41);
	    counterText.setText(counter);
	    counterText.setOffset({x: counterText.getWidth()/2})
	});
    this.layer.add(this.group);
    this.vhiSet.canvas.add(this.layer);
}
PathSlidebar.prototype.init = function() {
    this.top = this.vhiSet.vhiArray[0].startY-2*this.vhiSet.sqLength;
    this.rect.setY(this.top);
    this.counterText.setY(this.top-18);
};
PathSlidebar.prototype.update = function() {
    this.bot = this.vhiSet.vhiArray[this.vhiSet.vhiArray.length-1].startY+4*this.vhiSet.sqLength;
    this.rect.setHeight(this.bot-this.top);
    this.layer.moveToTop();
    this.layer.draw();
};