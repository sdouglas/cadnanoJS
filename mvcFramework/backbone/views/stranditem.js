var StrandItem = Backbone.View.extend({
    initialize: function(phItem, y, xL, xR) {
	//I hope you're used to the massive number of property values by now
	this.parent = phItem;
	this.layer = this.parent.options.parent.strandlayer;
	this.divLength = this.parent.options.graphics.divLength;
	this.blkLength = this.parent.options.graphics.blkLength;
	this.sqLength = this.parent.options.graphics.sqLength;
	this.strandColor = "#008800";
	this.yLevel = y;
	this.xStart = xL;
	this.xEnd = xR;

	//see explanation in EndPointItem.js; the implementation of these two classes share many similarities
        this.tempLayer = new Kinetic.Layer();
        this.tempLayer.setScale(this.parent.options.parent.scaleFactor);
        this.parent.options.handler.handler.add(this.tempLayer);

	this.group = new Kinetic.Group({
	    draggable: true,
            dragBoundFunc: function(pos) {
		return {
		    x: this.getAbsolutePosition().x,
		    y: this.getAbsolutePosition().y
		}
	    }
        });
	this.group.superobj = this;

	this.yCoord = this.parent.startY+(this.yLevel+0.5)*this.sqLength;
	this.xStartCoord = this.parent.startX+(this.xStart+1)*this.sqLength;
	this.xEndCoord = this.parent.startX+this.xEnd*this.sqLength;
	//the visible thin line connecting the two enditems
	this.connection = new Kinetic.Rect({
	    x: this.xStartCoord,
	    y: this.yCoord-1.5,
	    width: this.xEndCoord-this.xStartCoord,
	    height: 3,
	    fill: this.strandColor,
	    stroke: this.strandColor,
	    strokeWidth: 1
	});
	this.group.add(this.connection);
	//invisible rectangle that makes dragging the line much easier
	this.invisConnection = new Kinetic.Rect({
	    x: this.xStartCoord,
	    y: this.yCoord-this.sqLength/2,
	    width: this.xEndCoord-this.xStartCoord,
	    height: this.sqLength,
	    fill: "#FFFFFF",
	    stroke: "#FFFFFF",
	    strokeWidth: 1,
	    opacity: 0
	});
	this.group.add(this.invisConnection);

	//for more explanation, visit EndPointItem.js
	this.group.on("mousedown", function(pos) {
	    //counter has to be set up seperately because unlike EndPointItem, base-StrandItem is not a bijective relation. init is used for relative comparison later on.
	    this.dragCounterInit = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.superobj.parent.options.parent.scaleFactor-5*this.superobj.sqLength)/this.superobj.sqLength);
	    this.dragCounter = this.dragCounterInit;
	    this.pDragCounter = this.dragCounter;
	    //red box again
            this.redBox = new Kinetic.Rect({
		    x: this.superobj.endItemL.centerX-this.superobj.sqLength/2,
		    y: this.superobj.endItemL.centerY-this.superobj.sqLength/2,
		    width: this.superobj.sqLength*(this.superobj.xEnd-this.superobj.xStart+1),
		    height: this.superobj.sqLength,
		    fill: "transparent",
		    stroke: "#FF0000",
		    strokeWidth: 2,
		});
            this.redBox.superobj = this;
            this.redBox.on("mouseup", function(pos) {
                    this.remove();
                    this.superobj.superobj.tempLayer.draw();
                });
            this.superobj.tempLayer.add(this.redBox);
            this.superobj.tempLayer.draw();
	});
	this.group.on("dragmove", function(pos) {
	    this.dragCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.superobj.parent.options.parent.scaleFactor-5*this.superobj.sqLength)/this.superobj.sqLength);
	    //have to watch out for both left and right end in counter adjustment here
	    var diff = this.dragCounter-this.dragCounterInit;
	    if(this.superobj.xStart+diff < 0) {
		this.dragCounter = this.dragCounterInit-this.superobj.xStart;
	    }
	    else {
		var grLength = this.superobj.blkLength*this.superobj.divLength*this.superobj.parent.options.parent.part.getStep();
		if(this.superobj.xEnd+diff >= grLength) {
		    this.dragCounter = this.dragCounterInit+grLength-1-this.superobj.xEnd;
		}
	    }
	    //same as EndPointItem
	    if(this.dragCounter !== this.pDragCounter) {
		this.redBox.setX(this.redBox.getX()+(this.dragCounter-this.pDragCounter)*this.superobj.sqLength);
		this.superobj.tempLayer.draw();
		this.pDragCounter = this.dragCounter;
	    }
	});
	this.group.on("dragend", function(pos) {
	    var diff = this.dragCounter - this.dragCounterInit;
	    //deleting red box
            this.redBox.remove();
            this.superobj.tempLayer.draw();
	    //redrawing the line
	    this.superobj.connection.setX(this.superobj.connection.getX()+diff*this.superobj.sqLength);
	    this.superobj.invisConnection.setX(this.superobj.invisConnection.getX()+diff*this.superobj.sqLength);
	    //redraw enditems as well as updating their values
	    this.superobj.xStart += diff;
	    this.superobj.updateXStartCoord();
	    this.superobj.endItemL.counter += diff;
	    this.superobj.endItemL.updateCenterX();
	    this.superobj.endItemL.update();
	    this.superobj.xEnd += diff;
	    this.superobj.updateXEndCoord();
	    this.superobj.endItemR.counter += diff;
	    this.superobj.endItemR.updateCenterX();
	    this.superobj.endItemR.update();
	    //redraw xoveritems
	    if(this.superobj.endItemL instanceof XoverNode) {
		this.superobj.endItemL.updateLinkageX();
		var xoverL = this.superobj.endItemL.xoveritem;
		xoverL.connection.remove();
		xoverL.connection = new Kinetic.Shape({
		    stroke: this.superobj.strandColor,
		    strokeWidth: 3
		});
		xoverL.connection.superobj = xoverL;
		xoverL.connection.setDrawFunc(function(canvas) {
			var context = canvas.getContext();
			var x1 = xoverL.node3.linkageX;
			var y1 = xoverL.node3.linkageY;
			var x2 = xoverL.node5.linkageX;
			var y2 = xoverL.node5.linkageY;
			var ctrlpt = xoverL.quadCtrlPt(x1,y1,x2,y2,xoverL.node3.dir);
			context.beginPath();
			context.moveTo(x1,y1);
			context.quadraticCurveTo(ctrlpt.x,ctrlpt.y,x2,y2);
			canvas.stroke(this);
		    });
		xoverL.group.add(xoverL.connection);
		xoverL.invisConnection.setX(Math.min(xoverL.node3.centerX,xoverL.node5.centerX)-xoverL.sqLength/2);
		xoverL.invisConnection.setWidth(Math.abs(xoverL.node3.centerX-xoverL.node5.centerX)+xoverL.sqLength);
	    }
	    if(this.superobj.endItemR instanceof XoverNode) {
		this.superobj.endItemR.updateLinkageX();
		var xoverR = this.superobj.endItemR.xoveritem;
		xoverR.connection.remove();
		xoverR.connection = new Kinetic.Shape({
		    stroke: this.superobj.strandColor,
		    strokeWidth: 3
		});
		xoverR.connection.superobj = xoverR;
		xoverR.connection.setDrawFunc(function(canvas) {
			var context = canvas.getContext();
			var x1 = xoverR.node3.linkageX;
			var y1 = xoverR.node3.linkageY;
			var x2 = xoverR.node5.linkageX;
			var y2 = xoverR.node5.linkageY;
			var ctrlpt = xoverR.quadCtrlPt(x1,y1,x2,y2,xoverR.node3.dir);
			context.beginPath();
			context.moveTo(x1,y1);
			context.quadraticCurveTo(ctrlpt.x,ctrlpt.y,x2,y2);
			canvas.stroke(this);
		    });
		xoverR.group.add(xoverR.connection);
		xoverR.invisConnection.setX(Math.min(xoverR.node3.centerX,xoverR.node5.centerX)-xoverR.sqLength/2);
		xoverR.invisConnection.setWidth(Math.abs(xoverR.node3.centerX-xoverR.node5.centerX)+xoverR.sqLength);
	    }
	    //finally we can redraw the layer...
	    this.superobj.layer.draw();
	});

	this.layer.add(this.group);
	//this.layer.draw(); (not needed as you should be making the endItems immediately afterwards)
	//this.connectSignalsSlots();
    },

    updateXStartCoord: function() {this.xStartCoord = this.parent.startX+(this.xStart+1)*this.sqLength;},
    updateXEndCoord: function() {this.xEndCoord = this.parent.startX+this.xEnd*this.sqLength;},

    addEndItem: function(ei, dir) {
	if(dir === "L") {
	    this.endItemL = ei;
	}
	else {
	    this.endItemR = ei;
	}
	this.layer.draw();
    },

    events:
    {
    
    },

    connectSignalsSlots: function() {
        this.listenTo(cadnanoEvents.strandResizedSignal,
		      this.strandResizedSlot);
    },

    strandResizedSlot: function() {
    },
});