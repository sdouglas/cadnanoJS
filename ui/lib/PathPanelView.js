//Path panel item creates new canvas in a DOM element of choice and all attached items are drawn on this canvas.
function UI_PathPanelItem(elem,w,h) {
    this.domele = elem;
    this.canvasSettings = {container: elem, width: w, height: h};
    this.canvas = new Kinetic.Stage(this.canvasSettings);
}

//This class keeps track of all VHI (virtual helix item) and maintains an uniform standard for VHIs.
function UI_VirtualHelixSet(panel,gridMode,sqlen) {
    this.pathpanel = panel;
    //copying input params so attached items can use them
    this.canvas = panel.canvas;
    this.mode = gridMode;
    this.sqLength = sqlen;
    this.startX = 5*this.sqLength;
    this.startY = 5*this.sqLength;
    //items that latch on to the set: an array of VirtualHelixItem and PathSlidebarItem
    this.vhiArray = new Array();
    this.slidebar; //initialize only when vhiArray is not empty
    this.basechanger; //initialize only when vhiArray is nonempty
    //grid and divider
    this.grLength = new Number;
    this.divLength = new Number;
    if(this.mode === "honeycomb") {
	this.grLength = 42;
	this.divLength = 7;
    }
    else if(this.mode === "square") {
	this.grLength = 48;
	this.divLength = 8;
    }
    else { //You better check for typos!
	alert("Grid type does not exist, script aborted");
	throw "stop execution";
    }
    //strand layer to increase efficiency
    this.slayer = new Kinetic.Layer();
    this.canvas.add(this.slayer);
}
//resizes panel such that everything just fits in; this function shouldn't really be in this class but w/e...
UI_VirtualHelixSet.prototype.resize = function() {
    this.canvas.setSize(2*this.startX+this.sqLength*this.grLength+2*Math.floor(this.grLength/this.divLength),2*this.startY+4*this.vhiArray.length*this.sqLength);
};
//add & remove VHI to vhiArray, as well as slidebar update
UI_VirtualHelixSet.prototype.addVHI = function() {
    this.vhiArray.push(new UI_VirtualHelixItem(this));
    if(this.vhiArray.length === 1) {
	this.slidebar = new UI_PathSlidebarItem(this);
	this.basechanger = new UI_BaseLengthChanger(this);
    }
    this.slidebar.update();
    this.resize();
};
UI_VirtualHelixSet.prototype.removeVHI = function() {
    if(this.vhiArray.length != 0) {
	this.vhiArray[this.vhiArray.length-1].layer.remove();
	this.vhiArray.pop();
	if(this.vhiArray.length > 0) {
	    this.slidebar.update();
	}
	else {
	    this.slidebar.layer.remove();
	    this.slidebar = undefined;
	    this.basechanger.layer.remove();
	    this.basechanger = undefined;
	}
	this.resize();
    }
};
//updates existing VHIs to correct length and changes grLength for future VHIs
UI_VirtualHelixSet.prototype.updateLen = function(nl) {
    if(nl === null) {return;}
    var newLen = parseInt(nl,10); //nl (used to be newLen) and this.grLength was interpreted as strings, causing errors
    for(var k=0; k<this.vhiArray.length; k++) {
	var vhi = this.vhiArray[k];
	//adding bases
	if(newLen >= this.grLength) {
	    for(var i=parseInt(this.grLength,10); i<parseInt(newLen,10); i++) {
		for(var j=0; j<2; j++) {
		    var rect = new Kinetic.Rect({
			    x: vhi.startX+i*vhi.sqLength+2*Math.floor(i/this.divLength),
			    y: vhi.startY+j*vhi.sqLength,
			    width: vhi.sqLength,
			    height: vhi.sqLength,
			    fill: "#FFFFFF",
			    stroke: "#DDDDDD",
			    strokeWidth: 2
			});
		    vhi.baseArray[j][i] = rect;
		    vhi.layer.add(rect);
		}
	    }
	}
	else {
	    for(var i=parseInt(newLen,10); i<parseInt(this.grLength,10); i++) {
		for(var j=0; j<2; j++) {
		    vhi.baseArray[j][i].remove();
		    vhi.baseArray[j][i] = undefined;
		}
	    }
	}
	vhi.layer.draw();
    }
    //if removing bases, move the slidebar to visible area
    if(newLen < this.grLength && newLen-1 < this.slidebar.getCounter()) {
	this.slidebar.setCounter(newLen-1);
	var initX = this.slidebar.initcounter*this.sqLength+2*Math.floor(this.slidebar.initcounter/this.divLength);
	var newX = this.slidebar.getCounter()*this.sqLength+2*Math.floor(this.slidebar.getCounter()/this.divLength);
	this.slidebar.group.setX(newX-initX);
	this.slidebar.counterText.setText(this.slidebar.getCounter());
	this.slidebar.layer.draw();
    }
    this.grLength = newLen;
    this.resize();
};

//VHI is the collection of bases as well as the corresponding HelixCounterItem
function UI_VirtualHelixItem(vhiSet) {
    this.helixset = vhiSet;
    //taking params from VirtualHelixSet
    this.num = vhiSet.vhiArray.length;
    this.sqLength = vhiSet.sqLength;
    this.startX = vhiSet.startX;
    this.startY = vhiSet.startY + 4*this.num*this.sqLength;
    this.canvas = vhiSet.canvas;
    this.layer = new Kinetic.Layer();
    this.counter = new UI_HelixCounterItem(this);
    //an 2D array that keeps track of bases; it's in (y,x) instead of the more popular form (x,y) because of eaiser base addition & removal
    this.baseArray = new Array();
    this.baseArray[0] = new Array();
    this.baseArray[1] = new Array();
    //array construction
    for(var i=0; i<vhiSet.grLength; i++) {
	for(var j=0; j<2; j++) {
	    var rect = new Kinetic.Rect({
		    x: this.startX+i*this.sqLength+2*Math.floor(i/vhiSet.divLength),
		    y: this.startY+j*this.sqLength,
		    width: this.sqLength,
		    height: this.sqLength,
		    fill: "#FFFFFF",
		    stroke: "#DDDDDD",
		    strokeWidth: 2
		});
	    this.baseArray[j][i] = rect;
	    this.layer.add(rect);
	}
    }
    //add layer to canvas
    this.canvas.add(this.layer);
};

//The name of this class says it all
function UI_HelixCounterItem(vhi) {
    this.group = new Kinetic.Group();
    //circle
    var circle = new Kinetic.Circle({
	    radius: vhi.sqLength,
	    x: vhi.startX-2.5*vhi.sqLength,
	    y: vhi.startY+vhi.sqLength,
	    fill: "#FFE400",
	    stroke: "#808080",
	    strokeWidth: 2
        });
    this.group.add(circle);
    //number in the middle of circle
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
    this.group.add(helixNumText);
    this.group.on("mouseenter", function() {circle.setStroke("#3333FF"); vhi.layer.draw();});
    this.group.on("mouseleave", function() {circle.setStroke("#808080"); vhi.layer.draw();});
    vhi.layer.add(this.group);
}

//draggable slidebar on top of VHIs
function UI_PathSlidebarItem(vhis) {
    var initcounter = vhis.grLength/2;
    this.initcounter = initcounter; //updateLen from VHelixSet needs to access this number
    this.counter = initcounter;
    this.vhiSet = vhis;
    this.layer = new Kinetic.Layer();
    this.top = this.vhiSet.vhiArray[0].startY-2*this.vhiSet.sqLength;
    this.bot = 0;
    this.rect = new Kinetic.Rect({
	    x: this.vhiSet.startX+this.getCounter()*this.vhiSet.sqLength+2*Math.floor(this.getCounter()/vhis.divLength),
	    y: this.top,
	    width: this.vhiSet.sqLength,
	    height: this.bot-this.top,
	    fill: "#FFAA80",
	    stroke: "#000000",
	    strokeWidth: 1,
	    opacity: 0.5
	});
    var rect = this.rect;
    this.counterText = new Kinetic.Text({
	    x: this.vhiSet.startX+(this.getCounter()+0.5)*this.vhiSet.sqLength+2*Math.floor(this.getCounter()/vhis.divLength),
	    y: this.top-18,
	    text: this.getCounter(),
	    fontSize: 16,
	    fontFamily: "Calibri",
	    fill: "#000000",
	});
    var counterText = this.counterText;
    counterText.setOffset({
	    x: counterText.getWidth()/2
	});
    this.group = new Kinetic.Group({
	    draggable: true,
	    dragBoundFunc: function(pos) {
		//changing text settings; these lines are here so it can be in sync with the bar
		//if you still don't understand, put the 2 lines after counter mechanism and drag your mouse near border
		counterText.setText(vhis.slidebar.getCounter());
		counterText.setOffset({x: counterText.getWidth()/2});
		//limit slidebar to be right on top of bases
		return {
		    x: (vhis.slidebar.getCounter()-initcounter)*vhis.sqLength+2*Math.floor(vhis.slidebar.getCounter()/vhis.divLength)-2*Math.floor(initcounter/vhis.divLength),
		    y: this.getAbsolutePosition().y
		}
	    }
	});
    this.group.add(this.rect);
    this.group.add(this.counterText);
    this.group.on("dragmove", function(pos) {
	    //actually, that wasn't too bad compared to this... welcome to the new counter calculation mecahnism
	    var blockLen = vhis.divLength*vhis.sqLength+2;
	    //these 2 lines only work with current cadnano3.html panel layout but divs can be renamed
	    var blockNum = Math.floor((pos.x-51-innerLayout.state.west.innerWidth+document.getElementById(vhis.pathpanel.domele).scrollLeft-vhis.startX)/blockLen);
	    var tempCounter = Math.floor((pos.x-51-innerLayout.state.west.innerWidth+document.getElementById(vhis.pathpanel.domele).scrollLeft-blockNum*blockLen-vhis.startX)/vhis.sqLength)+blockNum*vhis.divLength;
	    vhis.slidebar.setCounter(Math.min(Math.max(0,tempCounter),vhis.grLength-1));
	    //alternative method: estimate base length to be sqLength+2/divLength (easier computation, but potential problem near border)
	});
    this.layer.add(this.group);
    this.vhiSet.canvas.add(this.layer);
}
//accessor and mutator functions
UI_PathSlidebarItem.prototype.getCounter = function() {return this.counter;};
UI_PathSlidebarItem.prototype.setCounter = function(n) {this.counter = n;};
//update slidebar info
UI_PathSlidebarItem.prototype.update = function() {
    this.bot = this.vhiSet.vhiArray[this.vhiSet.vhiArray.length-1].startY+4*this.vhiSet.sqLength;
    this.rect.setHeight(this.bot-this.top);
    this.layer.moveToTop();
    this.layer.draw();
};

//A psuedo-button that changes base length. This function merges the two arrow buttons in cadnano2.
function UI_BaseLengthChanger(vhis) {
    this.layer = new Kinetic.Layer();
    this.group = new Kinetic.Group();
    //These params for rect and text is only good for vhis.sqLength = 20 (direct scaling doesn't work either)
    this.rect = new Kinetic.Rect({
	    x: 0,
	    y: 0,
	    width: 125,
	    height: 20,
	    stroke: '#000000',
	    strokeWidth: 1,
	    fill: '#88FF88'
	});
    this.text = new Kinetic.Text({
	    x: 3,
	    y: 3,
	    text: "change base length",
	    fontSize: 15,
	    fontFamily: "Calibri",
	    fill: "#000000",
	});
    this.group.add(this.rect);
    this.group.add(this.text);
    this.group.on("click", function() {
	    var newLen = prompt("Enter new length:","");
	    vhis.updateLen(newLen);
	});
    this.layer.add(this.group);
    vhis.canvas.add(this.layer);
}