var StrandItem = Backbone.View.extend({
	initialize: function(phItem, y, xL, xR, endtypeL, endtypeR) {
	//I hope you're used to the massive number of property values by now
	this.parent = phItem;
	this.layer = this.parent.options.parent.strandlayer;
	this.divLength = this.parent.options.graphics.divLength;
	this.blkLength = this.parent.options.graphics.blkLength;
	this.sqLength = this.parent.options.graphics.sqLength;
	this.strandColor = this.parent.options.parent.paintcolor;
	this.yLevel = y;
	this.xStart = xL;
	this.xEnd = xR;

	//see explanation in EndPointItem.js; the implementation of these two classes share many similarities
        this.tempLayer = new Kinetic.Layer();
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
	    var pathTool = this.superobj.parent.options.model.part.currDoc.pathTool;
	    if(pathTool === "select") {
		this.superobj.selectStart(pos);
	    }
	});
	this.group.on("click", function(pos) {
	    var pathTool = this.superobj.parent.options.model.part.currDoc.pathTool;
	    if(pathTool === "break") {
		this.superobj.breakStrand(pos);
	    }
	    else if(pathTool === "paint") {
		this.superobj.paintStrand();
	    }
	    else if(pathTool === "seq") {
		/*
		var newDialog = $('<div><iframe src="cadnanoSeq.html" width="270" height="300"></div>');
		$(newDialog).dialog({
		    width: 301,
		    height: 420,
		    modal: true,
		    title: "Choose Sequence",
		    show: "clip",
		    hide: "clip",
		    buttons: {
			OK: function() {$(this).dialog("close")},
		        Cancel: function() {$(this).dialog("close");}
		    }
		});
		$(".ui-dialog-titlebar-close", this.parentNode).hide();
		*/
		this.superobj.applySeq("AAATCG");
	    }
	});
	this.group.on("dragmove", function(pos) {
	    var pathTool = this.superobj.parent.options.model.part.currDoc.pathTool;
	    if(pathTool === "select") {
		this.superobj.selectMove(pos);
	    }
	});
	this.group.on("dragend", function(pos) {
	    var pathTool = this.superobj.parent.options.model.part.currDoc.pathTool;
	    if(pathTool === "select") {
		this.superobj.selectEnd(pos);
	    }
	});

	this.layer.add(this.group);
	if(endtypeL === "EndPointItem") {
	    this.endItemL = new EndPointItem(this,"L",4-(2*(this.parent.options.model.hID%2)-1),true);
	}
	else if(endtypeL === "XoverNode") {
	    this.endItemL = new XoverNode(this,"L",4-(2*(this.parent.options.model.hID%2)-1),true);
	}
	if(endtypeR === "EndPointItem") {
	    this.endItemR = new EndPointItem(this,"R",4+(2*(this.parent.options.model.hID%2)-1),true);
	}
	else if(endtypeR === "XoverNode") {
	    this.endItemR = new XoverNode(this,"R",4+(2*(this.parent.options.model.hID%2)-1),true);
	}
	this.layer.draw();
	//this.connectSignalsSlots();
    },

    events:
    {    
    },

    updateXStartCoord: function() {this.xStartCoord = this.parent.startX+(this.xStart+1)*this.sqLength;},
    updateXEndCoord: function() {this.xEndCoord = this.parent.startX+this.xEnd*this.sqLength;},

    update: function() {
	this.updateXStartCoord();
	this.updateXEndCoord();
	this.connection.setX(this.xStartCoord);
	this.connection.setWidth(this.xEndCoord-this.xStartCoord);
	this.invisConnection.setX(this.xStartCoord);
	this.invisConnection.setWidth(this.xEndCoord-this.xStartCoord);
    },

    addEndItem: function(ei, dir, skipRedraw) {
	if(dir === "L") {
	    this.endItemL = ei;
	}
	else {
	    this.endItemR = ei;
	}
	if(!skipRedraw) {
	    this.layer.draw();
	}
    },

    selectStart: function(pos) {
	//counter has to be set up seperately because unlike EndPointItem, base-StrandItem is not a bijective relation. init is used for relative comparison later on.
	this.dragCounterInit = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.parent.options.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	this.dragCounter = this.dragCounterInit;
	this.pDragCounter = this.dragCounter;
	//red box again
	this.redBox = new Kinetic.Rect({
	    x: this.endItemL.centerX-this.sqLength/2,
	    y: this.endItemL.centerY-this.sqLength/2,
	    width: this.sqLength*(this.xEnd-this.xStart+1),
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
	this.tempLayer.setScale(this.parent.options.parent.scaleFactor);
	this.tempLayer.add(this.redBox);
	this.tempLayer.draw();
    },

    selectMove: function(pos) {
	this.dragCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.parent.options.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	//have to watch out for both left and right end in counter adjustment here
	var diff = this.dragCounter-this.dragCounterInit;
	if(this.xStart+diff < 0) {
	    this.dragCounter = this.dragCounterInit-this.xStart;
	}
	else {
	    var grLength = this.blkLength*this.divLength*this.parent.options.parent.part.getStep();
	    if(this.xEnd+diff >= grLength) {
		this.dragCounter = this.dragCounterInit+grLength-1-this.xEnd;
	    }
	}
	//same as EndPointItem
	if(this.dragCounter !== this.pDragCounter) {
	    this.redBox.setX(this.redBox.getX()+(this.dragCounter-this.pDragCounter)*this.sqLength);
	    this.tempLayer.draw();
	    this.pDragCounter = this.dragCounter;
	}
    },

    selectEnd: function(pos) {
	var diff = this.dragCounter-this.dragCounterInit;
	//deleting red box
	this.redBox.remove();
	this.tempLayer.draw();
	//redrawing the line
	this.xStart += diff;
	this.xEnd += diff;
	this.update();
	//redraw enditems as well as updating their values
	this.endItemL.counter += diff;
	this.endItemL.update();
	this.endItemR.counter += diff;
	this.endItemR.update();
	//redraw xoveritems
	if(this.endItemL instanceof XoverNode) {
	    this.endItemL.xoveritem.update();
	}
	if(this.endItemR instanceof XoverNode) {
	    this.endItemR.xoveritem.update();
	}
	//finally we can redraw the layer...
	this.layer.draw();
    },

    breakStrand: function(pos) {
	if(this.endItemL.prime === 5) {
	    var counter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.parent.options.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	    if(this.xEnd-counter > 1) {
		var strand1 = new StrandItem(this.parent,this.yLevel,this.xStart,counter,null,"EndPointItem");
		this.endItemL.parent = strand1;
		strand1.addEndItem(this.endItemL,"L");
		var strand2 = new StrandItem(this.parent,this.yLevel,counter+1,this.xEnd,"EndPointItem",null);
		this.endItemR.parent = strand2;
		strand2.addEndItem(this.endItemR,"R");
		this.close();
		this.group.destroy();
		this.layer.draw();
		return;
	    }
	}
	else {
	    var counter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.parent.options.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	    if(counter-this.xStart > 1) {
		var strand1 = new StrandItem(this.parent,this.yLevel,this.xStart,counter-1,null,"EndPointItem");
		this.endItemL.parent = strand1;
		strand1.addEndItem(this.endItemL,"L");
		var strand2 = new StrandItem(this.parent,this.yLevel,counter,this.xEnd,"EndPointItem",null);
		this.endItemR.parent = strand2;
		strand2.addEndItem(this.endItemR,"R");
		this.close();
		this.group.destroy();
		this.layer.draw();
		return;
	    }
	}
    },

    paintStrand: function() {
	var colour = this.parent.options.parent.paintcolor;
	this.strandColor = colour;
	this.connection.setFill(colour);
	this.connection.setStroke(colour);
	//rest of recursion goes in here
	this.layer.draw();
    },

    applySeq: function(seq) {
	var layer = this.parent.options.parent.finallayer;
	var zf = this.parent.options.parent.scaleFactor;
	var stringLen = seq.length;
	var strandLen = this.xEnd-this.xStart+1;
	//sequencing goes 5' -> 3'
	for(var i=0; i<Math.min(stringLen,strandLen); i++) {
	    var text = new Kinetic.Text({
		x: (this.endItemL.prime === 5)?this.parent.startX+(this.xStart+i+0.5)*this.sqLength:this.parent.startX+(this.xEnd-i+0.5)*this.sqLength,
		y: this.yCoord-(2*this.yLevel-1)/4*this.sqLength,
		text: seq.charAt(i),
		fontSize: this.sqLength/2,
		fontFamily: "Calibri",
		fill: "#000000",
	    });
	    text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
	    layer.setScale(zf);
	    layer.add(text);
	}
	layer.draw();
    },

    connectSignalsSlots: function() {
        this.listenTo(cadnanoEvents.strandResizedSignal,
		      this.strandResizedSlot);
    },

    strandResizedSlot: function() {
    },
});
