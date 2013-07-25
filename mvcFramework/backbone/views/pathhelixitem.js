var PathHelixSetItem = Backbone.View.extend({
    initialize: function(){
	//pathTool variables
	this.pencilendpoint = undefined;
	this.paintcolor = "#008800";
	//PathHelixSetItem should contains variables that multiple sub-classes need
        this.handler = this.options.handler;
        this.part = this.options.part;
	//path view layers
	this.backlayer = new Kinetic.Layer(); //background layer: PathHelixItem, PathHelixHandlerItem, PathBaseChangeItem
	this.handler.handler.add(this.backlayer);
	this.activeslicelayer = new Kinetic.Layer(); //slidebar layer: ActiveSliceItem
	this.handler.handler.add(this.activeslicelayer);
	this.buttonlayer = new Kinetic.Layer(); //button layer: PathBaseChangeItem, ColorChangeItem
	this.handler.handler.add(this.buttonlayer);
	this.strandlayer = new Kinetic.Layer(); //strand layer: StrandItem, EndPointItem, XoverItem
	this.handler.handler.add(this.strandlayer);
	//some things should be on the top
	this.activeslicelayer.moveToTop();

	//scale factor
	this.ratioX = 1;
	this.ratioY = 1;
	this.pratioX = 1;
	this.pratioY = 1;
	this.scaleFactor = 1;
	//objects
	this.phItemArray = new Array(); //stores PathHelixItem
	this.graphicsSettings = {
	    sqLength: 20,
	    divLength: 7,
	    blkLength: 3
	};
	//slidebar
	this.activesliceItem = new ActiveSliceItem({
	    handler: this.handler,
	    parent: this,
	    graphics: this.graphicsSettings
	});
    },
    events: {
        "mousemove" : "onMouseMove",
    },
    renderBack: function(){
	//removing all old shapes before drawing new ones
	this.backlayer.removeChildren();
	this.buttonlayer.removeChildren();
	this.phItemArray = new Array();
        console.log('in render function vhitemset');
	//buttons
	this.c2Item = new ColorChangeItem({
	    parent: this,
	});
	this.pbcItem = new PathBaseChangeItem({
	    handler: this.handler,
	    parent: this,
	    graphics: this.graphicsSettings
	});
	//variables that the items created in foreach loop can access
        var h = this.handler;
	var dims = this.graphicsSettings;
	dims.grLength = dims.blkLength*dims.divLength*this.part.getStep(); //grLength is only used here because background is immutable
	var helixset = this;
	var pharray = this.phItemArray;
	//for each VirtualHelixItem, we create a path helix and a path helix handler
        this.collection.each(function(vh){
            var phItem = new PathHelixItem({
                model: vh,
                handler: h,
		parent: helixset,
		graphics: dims 
            });
	    var phHandlerItem = new PathHelixHandlerItem({
		model: vh,
		handler: h,
		parent: helixset,
		graphics: dims
	    });
	    pharray.push(phItem);
        });

	//calculating the new scale factor
	this.ratioX = Math.min(1,this.handler.handler.getWidth()/(8*dims.sqLength+dims.sqLength*dims.grLength));
	this.ratioY = Math.min(1,this.handler.handler.getHeight()/(7*dims.sqLength+4*pharray.length*dims.sqLength));
	//no scale factor changes, just redraw backlayer
	if(this.ratioX === this.pratioX && this.ratioY === this.pratioY) {
	    this.backlayer.draw();
	}
	//scale factor changed, have to rescale and redraw EVERY layer and update pratio
	else {
	    this.scaleFactor = Math.min(this.ratioX,this.ratioY);
	    this.backlayer.setScale(this.scaleFactor); //ensures everything can be seen while maintaining aspect ratio
	    this.backlayer.draw();
	    this.activeslicelayer.setScale(this.scaleFactor);
	    this.activeslicelayer.draw();
	    this.buttonlayer.setScale(this.scaleFactor);
	    this.buttonlayer.draw();
	    this.strandlayer.setScale(this.scaleFactor);
	    this.strandlayer.draw();
	    this.finallayer.setScale(this.scaleFactor);
	    this.finallayer.draw();
	    //reset previous ratio
	    this.pratioX = this.ratioX;
	    this.pratioY = this.ratioY;
	}
	//for UI testing purpose only, delete in final version
	var strandItem0 = new StrandItem(pharray[pharray.length-1],pharray[pharray.length-1].options.model.hID%2,7,34,"EndPointItem","EndPointItem");
	//end of testing block
    },


    onMouseMove: function(e){
    },

    remove: function(){
    },

});

//the long rectangular base grid
var PathHelixItem = Backbone.View.extend ({
    initialize: function(){
	this.layer = this.options.parent.backlayer;
	this.group = new Kinetic.Group();
	this.grLength = this.options.graphics.grLength;
	this.divLength = this.options.graphics.divLength;
	this.sqLength = this.options.graphics.sqLength;

	this.startX = 5*this.sqLength;
	this.startY = 5*this.sqLength+4*(this.options.parent.phItemArray.length)*this.sqLength;
	for(var i=0; i<this.grLength; i++) {
	    for(var j=0; j<2; j++) {
		var rect = new Kinetic.Rect({
		    x: this.startX+i*this.sqLength,
		    y: this.startY+j*this.sqLength,
		    width: this.sqLength,
		    height: this.sqLength,
		    fill: "#FFFFFF",
		    stroke: "#DDDDDD",
		    strokeWidth: 2,
		});
		this.group.add(rect);
	    }
	    if(i%7 == 0) { //divider lines are blacker
		var divLineXStart = this.startX+i*this.sqLength;
		var divLine = new Kinetic.Line({
		    points: [divLineXStart,this.startY,divLineXStart,this.startY+2*this.sqLength],
		    stroke: "#666666",
		    strokeWidth: 2
		});
		this.group.add(divLine);
	    }
	}
	this.layer.add(this.group);
	//mouse function: dragging on helix = new StrandItem
	var strandInitCounter = 0;
	var strandCounter = 0;
	var grLength = this.grLength;
	var tempLayer = new Kinetic.Layer();
        this.options.handler.handler.add(tempLayer);
	this.group.superobj = this;
	this.group.on("mousedown", function(pos) {
	    var yLevel = Math.floor((pos.y-46)/this.superobj.sqLength);
	    strandInitCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)-this.superobj.startX)/this.superobj.sqLength);
	    this.on("mousemove", function(pos) {
		strandCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)-this.superobj.startX)/this.superobj.sqLength);
		strandCounter = adjustCounter(strandCounter);
		if(Math.abs(strandCounter-strandInitCounter) >= 2) {
		    //show imaginary strand
		}
		function adjustCounter(n) {
		    return Math.min(Math.max(0,n),grLength);
		}
	    });
	    this.on("mouseup", function(pos) {
		if(Math.abs(strandCounter-strandInitCounter) >= 2) {
		    var newStrand = new StrandItem(this.superobj, 1, Math.min(strandCounter,strandInitCounter), Math.max(strandCounter,strandInitCounter), "EndPointItem", "EndPointItem");
		}
		tempLayer.destroyChildren();
		this.off("mousemove");
		this.off("mouseup");
	    });
	});
    },
});

//the circle next to PathHelixItem
var PathHelixHandlerItem = Backbone.View.extend({
    initialize: function() {
	this.sqLength = this.options.graphics.sqLength;
	this.part = this.options.model.getPart();

	this.layer = this.options.parent.backlayer;
	this.group = new Kinetic.Group();
	var helixNum = this.options.model.hID;
	var circ = new Kinetic.Circle({
	    x: 2.5*this.sqLength,
	    y: 6*this.sqLength + 4*(this.options.parent.phItemArray.length)*this.sqLength,
	    radius: this.part.radius,
	    fill: colours.orangefill,
	    stroke: colours.orangestroke,
	    strokewidth: colours.strokewidth
	});
	//number on the circle, based on utils/kinetichandler.js
        var helixNumText = new Kinetic.Text({
	    x: circ.getX(),
	    y: circ.getY()-circ.getRadius()/2,
	    text: helixNum,
	    fontSize: this.sqLength,
	    fontFamily: "Calibri",
	    fill: "#000000",
	});
	helixNumText.setOffset({
	    x: helixNumText.getWidth()/2
	});
        //end: number on the circle
	this.group.add(circ);
        this.group.add(helixNumText);
	this.layer.add(this.group);
    },
});

//the two arrows on the top left corner that can change the length of PathHelixItem
var PathBaseChangeItem = Backbone.View.extend({
    initialize: function() {
	var part = this.options.parent.part;
	var canvas = this.options.handler.handler;
	var layer = this.options.parent.buttonlayer;
	var baseperblk = this.options.graphics.blkLength*this.options.graphics.divLength;

	var removeBaseImg = new Image();
	removeBaseImg.onload = function() {
	    var removeBase = new Kinetic.Image({
		    x: 0,
		    y: 0,
		    image: removeBaseImg,
		    width: 30,
		    height: 30
		});
	    removeBase.on("click",function() {
		    if(part.getStep() > 0) {
			part.setStep(part.getStep()-1);
		    }
		});
	    layer.add(removeBase);
	}
	removeBaseImg.src = "ui/images/remove-bases.svg";

	var addBaseImg = new Image();
	addBaseImg.onload = function() {
	    var addBase = new Kinetic.Image({
		    x: 30,
		    y: 0,
		    image: addBaseImg,
		    width: 30,
		    height: 30,
		});
	    addBase.on("click",function() {
		    var baseIncrease = prompt("Number of bases to add to the existing "+(baseperblk*part.getStep())+" bases (must be a multiple of "+baseperblk+")",baseperblk);
		    if(baseIncrease !== null) {
			var baseInc = parseInt(baseIncrease,10);
			if(baseInc > 0 && baseInc%baseperblk === 0) {
			    part.setStep(part.getStep()+baseInc/baseperblk);
			}
		    }
		});
	    layer.add(addBase);
	    layer.draw()
	};
	addBaseImg.src = "ui/images/add-bases.svg";
    },
});

//the box next to arrows. once clicked, webpage will prompt for RGB and set it as the color for next strand.
//if possible, try to make a pop up page with color picker and send value back to main webpage
var ColorChangeItem = Backbone.View.extend({
    initialize: function() {
	var layer = this.options.parent.buttonlayer;
	var rect = new Kinetic.Rect({
	    x: 65,
	    y: 5,
	    width: 20,
	    height: 20,
	    stroke: "#000000",
	    strokeWidth: 1,
	    fill: this.options.parent.paintcolor
	});
	rect.superobj = this;
	rect.on("click", function(pos) { //someone fix the duplicate dialog bug (it is also in stranditem.js)
	    window.localStorage.setItem("cadnanoPaint",rect.superobj.options.parent.paintcolor);
	    var newDialog = $('<link rel="stylesheet" href="ui/css/jquery-ui/jquery.ui-1.9.2.min.css"><div><iframe src="cadnanoPaint.html" width="195" height="224"></div>');
	    $(newDialog).dialog({
		width: 226,
		height: 344,
		modal: true,
	        title: "Color picker",
		show: "clip",
		hide: "clip",
		buttons: {
		    OK: function() {update(); $(this).dialog("close")},
		    Cancel: function() {$(this).dialog("close");}
		}
	    });
	    $(".ui-dialog-titlebar-close", this.parentNode).hide();
	})
	function update() {
	    rect.superobj.options.parent.paintcolor = window.localStorage.getItem("cadnanoPaint");
	    rect.setFill(rect.superobj.options.parent.paintcolor);
	    layer.draw();		
	}
	layer.add(rect);
    },
});