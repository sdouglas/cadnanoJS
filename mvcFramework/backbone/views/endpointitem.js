var EndPointItem = Backbone.View.extend({
    initialize: function(strand, dir, type, skipRedraw) {
	//accessing other objects
	this.parent = strand;
	this.phItem = this.parent.parent;
	this.layer = this.parent.layer;
	//temporary layer that will be used for fast rendering
	this.tempLayer = new Kinetic.Layer();
	this.phItem.options.handler.handler.add(this.tempLayer);
	//graphics
	this.divLength = this.parent.divLength;
	this.blkLength = this.parent.blkLength;
	this.sqLength = this.parent.sqLength;
	//counters
	if(dir === "L") {
	    this.initcounter = this.parent.xStart;
	}
	else if(dir === "R") {
	    this.initcounter = this.parent.xEnd;
	}
	this.counter = this.initcounter;
	this.pCounter = this.counter;
	//starting position
	this.centerX = this.phItem.startX+(this.counter+0.5)*this.sqLength;
	this.centerY = this.parent.yCoord;
	//misc. properties
	this.dir = dir;
	this.prime = type;
	this.parity = (this.phItem.options.model.hID)%2;
	//vertices of the shape
	var polypts;
	if(this.prime === 3) { //3' end: triangle
	    polypts = [this.centerX-(2*this.parity-1)*this.sqLength*0.3,this.centerY,
		       this.centerX+(2*this.parity-1)*this.sqLength*0.5,this.centerY-this.sqLength*0.5,
		       this.centerX+(2*this.parity-1)*this.sqLength*0.5,this.centerY+this.sqLength*0.5];
	}
	else if(this.prime === 5) { //5' end: square
	    //reason I didn't use Kinetic.Rect: its getX() works differently and shows the shape at wrong position
	    polypts = [this.centerX-this.sqLength*0.2-this.sqLength*this.parity*0.3,this.centerY-this.sqLength*0.35,
		       this.centerX-this.sqLength*0.2-this.sqLength*this.parity*0.3,this.centerY+this.sqLength*0.35,
		       this.centerX+this.sqLength*0.5-this.sqLength*this.parity*0.3,this.centerY+this.sqLength*0.35,
		       this.centerX+this.sqLength*0.5-this.sqLength*this.parity*0.3,this.centerY-this.sqLength*0.35];
	}
	this.shape = new Kinetic.Polygon({
	    points: polypts,
	    fill: this.parent.strandColor,
	    stroke: "#000000",
	    strokeWidth: 1,
	    draggable: true,
	    dragBoundFunc: function(pos) {
		return {
		    x: this.getAbsolutePosition().x,
		    y: this.getAbsolutePosition().y
		}
	    }
	});
	this.shape.superobj = this; //javascript y u no have pointers?!
	this.shape.on("mousedown", function(pos) {
	    var pathTool = this.superobj.phItem.options.model.part.currDoc.pathTool;
	    /*
	      Since there are so many shapes on strandlayer, it is preferred to redraw the layer as few times as possible. For this reason, the layer is only refreshed when
	      the dragging is done. But this means the group should not move while dragging, and we need some other shapes to show where the group is. The red box is drawn
	      on a separate layer so render speed is fast. Both the implementation and idea are very similar to ActiveSliceItem, but this (and StrandItem) takes it a step
	      further.
	    */
	    if(pathTool === "select") {
		this.superobj.selectStart(pos);
	    }
	});
	this.shape.on("click", function(pos) {
	    var pathTool = this.superobj.phItem.options.model.part.currDoc.pathTool;
	    if(pathTool === "pencil") {
		this.superobj.createXover();
	    }
	});
	this.shape.on("dragmove", function(pos) {
	    var pathTool = this.superobj.phItem.options.model.part.currDoc.pathTool;
	    if(pathTool === "select") {
		this.superobj.selectMove(pos);
	    }
	});
	this.shape.on("dragend", function(pos) {
	    var pathTool = this.superobj.phItem.options.model.part.currDoc.pathTool;
	    if(pathTool === "select") {
		this.superobj.selectEnd(pos);
	    }
	});
	this.layer.add(this.shape);
	this.parent.addEndItem(this,dir,skipRedraw); //finally linking this item back to strand
    },

    updateCenterX: function() {this.centerX = this.phItem.startX+(this.counter+0.5)*this.sqLength;},

    update: function() {
	this.updateCenterX();
	this.shape.setX((this.counter-this.initcounter)*this.sqLength);
    },

    adjustCounter: function(n) {
	this.counter = Math.min(Math.max(0,n),this.blkLength*this.divLength*this.phItem.options.parent.part.getStep()-1);
    },

    selectStart: function(pos) {
       this.redBox = new Kinetic.Rect({
	   x: this.centerX-this.sqLength/2,
	   y: this.centerY-this.sqLength/2,
	   width: this.sqLength,
	   height: this.sqLength,
	   fill: "transparent",
	   stroke: "#FF0000",
	   strokeWidth: 2,
       });
       this.redBox.superobj = this;
       this.redBox.on("mouseup", function(pos) {
	   this.remove();
	   this.superobj.tempLayer.draw();
       });
       this.tempLayer.setScale(this.phItem.options.parent.scaleFactor);
       this.tempLayer.add(this.redBox);
       this.tempLayer.draw();
    },

    selectMove: function(pos) {
	//we still want to keep track of the location (by counter in this case) so we know where we should draw the red square
	var tempCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.phItem.options.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	this.adjustCounter(tempCounter);
	if(this.counter !== this.pCounter) {
	    //redrawing red box
	    this.redBox.setX(this.redBox.getX()+(this.counter-this.pCounter)*this.sqLength)
	    this.tempLayer.draw();
	    this.pCounter = this.counter;
	    //throw out signals here
	}
    },

    selectEnd: function(pos) {
	//red box has finished its duty, to be deleted
	this.redBox.remove();
	this.tempLayer.draw();
	//redraw shape; wait for all elements to be adjusted to correct location before rendering
	this.update();
	//update counter and value in StrandItem
	if(this.dir === "L") {
	    this.parent.xStart = this.counter;
	}
	else {
	    this.parent.xEnd = this.counter;
	}
	//redrawing the line between two enditems aka strand
	this.parent.update();
	this.layer.draw();
    },

    createXover: function() {
	var helixset = this.phItem.options.parent;
	if(helixset.pencilendpoint === undefined) {
	    helixset.pencilendpoint = this;
	    var pencilNotifier = helixset.pencilendpoint.shape.clone();
	    pencilNotifier.setFill("#FF0000");
	    this.tempLayer.setScale(this.phItem.options.parent.scaleFactor);
	    this.tempLayer.add(pencilNotifier);
	    this.tempLayer.draw();
	}
	else {
	    var nodeAInfo = {
		strand: helixset.pencilendpoint.parent,
		dir: helixset.pencilendpoint.dir,
		type: helixset.pencilendpoint.prime
	    };
	    var nodeBInfo = {
		strand: this.parent,
		dir: this.dir,
		type: this.prime
	    };
	    if(nodeAInfo.type + nodeBInfo.type === 8) {
		helixset.pencilendpoint.tempLayer.destroyChildren();
		helixset.pencilendpoint.tempLayer.draw();
		helixset.pencilendpoint.close();
		helixset.pencilendpoint.shape.destroy();
		helixset.pencilendpoint = undefined;
		this.close();
		this.shape.destroy();
		this.shape = undefined; //check if this line is actually needed
		var nodeA = new XoverNode(nodeAInfo.strand, nodeAInfo.dir, nodeAInfo.type);
		var nodeB = new XoverNode(nodeBInfo.strand, nodeBInfo.dir, nodeBInfo.type);
		var xover = new XoverItem(nodeA,nodeB); //initialization comes with a redrawn strandlayer
		return;
	    }
	    else {
		alert("Crossover can only occur between a 3' and a 5'!");
	    }
	}
    },
});
