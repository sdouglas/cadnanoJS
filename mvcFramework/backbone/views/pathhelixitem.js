var PathHelixSetItem = Backbone.View.extend({
    initialize: function(){
	//pathTool variables
	this.pencilendpoint = undefined;
	this.paintcolor = "#008800";
	//PathHelixSetItem should contains variables that multiple sub-classes need
        this.handler = this.options.handler;
        this.part = this.options.part;
	this.panel = this.options.handler.handler.getContainer();

	//path view layers
	this.backlayer = new Kinetic.Layer(); //background layer: PathHelixItem, PathHelixHandlerItem, PathBaseChangeItem
	this.handler.handler.add(this.backlayer);
	this.prexoverlayer = new Kinetic.Layer(); //pre-crossover layer: PreXoverItem
	this.handler.handler.add(this.prexoverlayer);
	this.activeslicelayer = new Kinetic.Layer(); //slidebar layer: ActiveSliceItem
	this.handler.handler.add(this.activeslicelayer);
	this.buttonlayer = new Kinetic.Layer(); //button layer: PathBaseChangeItem, ColorChangeItem
	this.handler.handler.add(this.buttonlayer);
	this.strandlayer = new Kinetic.Layer(); //strand layer: StrandItem, EndPointItem, XoverItem
	this.handler.handler.add(this.strandlayer);
	this.alterationlayer = new Kinetic.Layer(); //alteration layer: InsertItem, SkipItem
	this.handler.handler.add(this.alterationlayer);
	this.finallayer = new Kinetic.Layer(); //final layer: post-sequencing bases
	this.handler.handler.add(this.finallayer);
	this.templayer = new Kinetic.Layer(); //temporary layer for faster rendering
	this.handler.handler.add(this.templayer);
	//some things should be on the top
	this.activeslicelayer.moveToTop();

	//objects
	this.phItemArray = new Array(); //stores PathHelixItem
	this.phItemArray.defined = new Array(); //stores ID of defined PathHelixItem
	this.graphicsSettings = {
	    sqLength: 20,
	    divLength: 7,
	    blkLength: 3
	};

	//scale factor
	this.userScale = 1;
	this.autoScale = Math.min(1,this.handler.handler.getWidth()/(this.graphicsSettings.sqLength*(8+2*this.graphicsSettings.divLength*this.graphicsSettings.blkLength)));
	this.scaleFactor = this.autoScale * this.userScale;
	this.pScaleFactor = this.scaleFactor;
	this.zoom();

	//slidebar
	this.activesliceItem = new ActiveSliceItem({
	    handler: this.handler,
	    parent: this,
	    graphics: this.graphicsSettings
	});

	/*
	this.bgLayer = new Kinetic.Layer({id: "bgLayer"});
	this.bgRect = new Kinetic.Rect({
	    x: 0,
	    y: 0,
	    width: this.handler.handler.getWidth(),
	    height: this.handler.handler.getHeight(),
	    opacity: 0,
	    id: "bgRect"
	});
	this.bgLayer.add(this.bgRect);
	this.handler.handler.add(this.bgLayer);
	this.bgLayer.moveToBottom();
	this.handler.handler.on("mousedown", function(pos) {
	    //alert("test");
	});
	*/
    },
    events: {
        "mousemove" : "onMouseMove",
    },
    render: function(){
	//removing all old shapes before drawing new ones
	//this.clear();
	this.buttonlayer.removeChildren();
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
	    if(pharray[vh.id]) return;
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
		graphics: dims,
		helixitem: phItem
	    });

	    pharray[vh.id] = phItem;
	    pharray.defined.push(vh.id);
        });

	//scaling and drawing
	var newWidth = this.graphicsSettings.sqLength*(8+this.part.getStep()*this.graphicsSettings.divLength*this.graphicsSettings.blkLength)*this.scaleFactor;
	this.handler.handler.setWidth(Math.max(newWidth, innerLayout.state.west.innerWidth));
	var newHeight = this.graphicsSettings.sqLength*(7+4*this.phItemArray.defined.length)*this.scaleFactor;
	this.handler.handler.setHeight(Math.max(newHeight, innerLayout.state.west.innerHeight));
	//no scale factor changes, just redraw backlayer
	if(this.scaleFactor === this.pScaleFactor) {
	    this.backlayer.draw();
	}
	//scale factor changed, have to rescale and redraw EVERY layer
	else {
	    this.backlayer.draw();
	    this.prexoverlayer.draw();
	    this.activeslicelayer.draw();
	    this.buttonlayer.draw();
	    this.strandlayer.draw();
	    this.alterationlayer.draw();
	    this.finallayer.draw();
	    this.pScaleFactor = this.scaleFactor;
	}
    },

    zoom: function() {
	this.scaleFactor = this.autoScale * this.userScale;
	var newWidth = this.graphicsSettings.sqLength*(8+this.part.getStep()*this.graphicsSettings.divLength*this.graphicsSettings.blkLength)*this.scaleFactor;
	this.handler.handler.setWidth(Math.max(newWidth, innerLayout.state.west.innerWidth));
	var newHeight = this.graphicsSettings.sqLength*(7+4*this.phItemArray.defined.length)*this.scaleFactor;
	this.handler.handler.setHeight(Math.max(newHeight, innerLayout.state.west.innerHeight));
	this.backlayer.setScale(this.scaleFactor);
	this.prexoverlayer.setScale(this.scaleFactor);
	this.activeslicelayer.setScale(this.scaleFactor);
	this.buttonlayer.setScale(this.scaleFactor);
	this.strandlayer.setScale(this.scaleFactor);
	this.alterationlayer.setScale(this.scaleFactor);
	this.finallayer.setScale(this.scaleFactor);
	this.templayer.setScale(this.scaleFactor);
    },

    redrawBack: function() {
	this.prexoverlayer.destroyChildren();
	this.backlayer.destroyChildren();
	for(var i=0; i<this.phItemArray.defined.length; i++) {
	    this.phItemArray[this.phItemArray.defined[i]].redraw();
	    this.phItemArray[this.phItemArray.defined[i]].helixhandler.initialize();
	}
	this.backlayer.draw();
    },

    onMouseMove: function(e){
    },

    remove: function(){
    },

    clear: function(){
        this.backlayer.removeChildren();
        var len = this.phItemArray.length;
        for(var i=0;i<len;i++){
            this.phItemArray[i].close();
        }
        this.phItemArray.length = 0;
        if(this.resizerItem) this.resizerItem.close();
        if(this.pbcItem) this.pbcItem.close();
        this.buttonlayer.removeChildren();
    },
});

//the long rectangular base grid
var PathHelixItem = Backbone.View.extend ({
    initialize: function(){
	this.panel = this.options.parent.panel;
	this.layer = this.options.parent.backlayer;
	this.group = new Kinetic.Group({
		draggable: true,
		dragBoundFunc: function(pos) {
		    return {
			x: this.getAbsolutePosition().x,
			y: this.getAbsolutePosition().y
		    }
		}
	    });
	this.grLength = this.options.graphics.grLength;
	this.divLength = this.options.graphics.divLength;
	this.blkLength = this.options.graphics.blkLength;
	this.sqLength = this.options.graphics.sqLength;
	this.order = this.options.parent.phItemArray.defined.length;
	this.scafItemArray = new Array();
	this.stapItemArray = new Array();
	this.startX = 5*this.sqLength;
	this.startY = 5*this.sqLength+4*this.order*this.sqLength;
        this.alterationArray = new Array();

	//Keeping track of all the strandItems
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
		    points: [divLineXStart,this.startY-1,divLineXStart,this.startY+2*this.sqLength+1],
		    stroke: "#666666",
		    strokeWidth: 2
		});
		this.group.add(divLine);
	    }
	}
	this.layer.add(this.group);
	this.connectSignalsSlots();
	
	var stItemImage;
	var strandInitCounter;
	var strandCounter;
	var strandPCounter;
	//mouse function: dragging on helix = new StrandItem
	//This is for the pencil object to drag and draw.
	this.group.superobj = this;
	this.group.on("dragstart", function(posStart) {
	    this.superobj.options.parent.prexoverlayer.destroyChildren();
	    this.superobj.options.parent.part.setActiveVirtualHelix(this.superobj.options.model);
	    if(this.superobj.options.model.part.currDoc.pathTool === "pencil") {
		var grLength = this.superobj.grLength;
		var zf = this.superobj.options.parent.scaleFactor;
		var yLevel = Math.floor(((posStart.y-54+this.superobj.panel.scrollTop)/zf-this.superobj.startY)/this.superobj.sqLength);
		strandInitCounter = Math.floor(((posStart.x-51-innerLayout.state.west.innerWidth+this.superobj.panel.scrollLeft)/zf-this.superobj.startX)/this.superobj.sqLength);
		strandCounter = strandInitCounter;
		strandPCounter = strandCounter;
		stItemImage = new StrandItemImage(this.superobj, yLevel, strandCounter, strandInitCounter);
	    }
	});
	this.on("dragmove", function(pos) {
		    if(pos.x) { //strandCounter will be NaN if this event is manually fired by stItemImage
			strandCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth+this.superobj.panel.scrollLeft)/zf-this.superobj.startX)/this.superobj.sqLength);
			strandCounter = adjustCounter(strandCounter);
		    }
		    if(strandCounter !== strandPCounter) {
			stItemImage.remove();
			stItemImage = new StrandItemImage(this.superobj, yLevel, strandCounter, strandInitCounter);
			strandPCounter = strandCounter;
		    }
		    function adjustCounter(n) {
			//TODO: fix it to move only to a specified length - minMaxindices.
			return Math.min(Math.max(0,n),grLength-1);
		    }
		});
		this.on("dragend", function() {
		    if(Math.abs(strandCounter-strandInitCounter) >= 2) {
			stItemImage.remove();
			this.superobj.options.parent.templayer.draw();
			//Call model with create strand.
			//Testing with just scaf strand set.
			var left = Math.min(strandCounter,strandInitCounter);
			var right = Math.max(strandCounter,strandInitCounter);
			var strandSet;
			if(yLevel^this.superobj.model.isEvenParity()) {
			    strandSet = this.superobj.options.model.scafStrandSet;
			}
			else {
			    strandSet = this.superobj.options.model.stapStrandSet;
			}
			if(!strandSet.hasStrandAt(left,right)) {
			    console.log('creating strand at :' + left + '::' + right);
			    strandSet.createStrand(left,right);
			}
		    }
		    this.off("mousemove");
		    this.off("mouseup");
		});
	    }
	//});
    },

    getStrandItem: function(isScaf, n, indexMode) {
	if(isScaf) {
	    for(var i=0; i<this.scafItemArray.length; i++) {
		if(this.scafItemArray[i] && this.scafItemArray[i].xStart <= n && this.scafItemArray[i].xEnd >= n) {
		    if(indexMode) {return i;}
		    return this.scafItemArray[i];
		}
	    }
	    return undefined;
	}
	else {
	    for(var i=0; i<this.stapItemArray.length; i++) {
		if(this.stapItemArray[i] && this.stapItemArray[i].xStart <= n && this.stapItemArray[i].xEnd >= n) {
		    if(indexMode) {return i;}
		    return this.stapItemArray[i];
		}
	    }
	    return undefined;
	}
    },

    updateY: function() {
	var oldY = this.startY;
	this.startY = 5*this.sqLength+4*this.order*this.sqLength;
	for(var i=0; i<this.scafItemArray.length; i++) {
	    this.scafItemArray[i].updateY();
	}
	for(var i=0; i<this.stapItemArray.length; i++) {
	    this.stapItemArray[i].updateY();
	}
        for(var i=0; i<this.grLength; i++) {
	    if(alterationArray[i]) {
		var group = this.alterationArray[i].skipInsertGroup;
		group.setY(group.getY()+this.startY-oldY);
	    }
        }
    },

    redraw: function() {
	this.startY = 5*this.sqLength+4*this.order*this.sqLength;
	this.grLength = this.blkLength*this.divLength*this.options.parent.part.getStep();
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
		    points: [divLineXStart,this.startY-1,divLineXStart,this.startY+2*this.sqLength+1],
		    stroke: "#666666",
		    strokeWidth: 2
		});
		this.group.add(divLine);
	    }
	}
	this.layer.add(this.group);
    },

    connectSignalsSlots: function() {
        this.listenTo(this.model.scafStrandSet,
                cadnanoEvents.strandSetStrandAddedSignal,
                this.strandAddedSlot
		);
        this.listenTo(this.model.scafStrandSet,
                cadnanoEvents.strandSetStrandRemovedSignal,
                this.strandRemovedSlot
                );
        this.listenTo(this.model.stapStrandSet,
                cadnanoEvents.strandSetStrandAddedSignal,
                this.strandAddedSlot
                );
        this.listenTo(this.model.stapStrandSet,
                cadnanoEvents.strandSetStrandRemovedSignal,
                this.strandRemovedSlot
                );
    	this.listenTo(this.model.scafStrandSet,
		cadnanoEvents.updateSkipInsertItemsSignal,
		this.updateSkipInsertItemsSlot);
    	this.listenTo(this.model.stapStrandSet,
		cadnanoEvents.updateSkipInsertItemsSignal,
		this.updateSkipInsertItemsSlot);
    },

    strandAddedSlot: function(strand, id) {
        //Create a strand item object.
	var stItem = new StrandItem(
	    strand,
	    this,
	    strand.baseIdxLow,
	    strand.baseIdxHigh
	);
	if(stItem.isScaf) {
	    this.scafItemArray.push(stItem);
	}
	else {
	    this.stapItemArray.push(stItem);
	}
    },

    strandRemovedSlot: function(strand) {
	var stItemArray = this.stapItemArray;
	if(strand.strandSet.isScaffold()) {
	    stItemArray = this.scafItemArray;
	}
        var len = stItemArray.length;
        console.log(len);
        for(var i=0; i<len; i++){
            if(stItemArray[i].modelStrand === strand){
                stItemArray[i].getRidOf(true);
                stItemArray.splice(i,1);
		return true;
            }
        }
        return false;
    },
 
    /**
	Redraw the skip items based on whether or not a
	strand is present.
    */
    updateSkipInsertItemsSlot: function(){
	for(var i=0; i<this.grLength; i++) {
	    if(this.alterationArray[i]) { //has insert/skip in the position
		if(this.getStrandItem(true, i)) { //if scaffold strand exists
		    if(this.alterationArray[i] instanceof InsertItem) {
			this.alterationArray[i].scafGroup.triangle.setStroke(this.getStrandItem(true, i).strandColor);
		    }
		    this.alterationArray[i].scafGroup.show();
		}
		else {
		    this.alterationArray[i].scafGroup.hide();
		}
		if(this.getStrandItem(false, i)) { //if staple strand exists
		    if(this.alterationArray[i] instanceof InsertItem) {
			this.alterationArray[i].stapGroup.triangle.setStroke(this.getStrandItem(false, i).strandColor);
		    }
		    this.alterationArray[i].stapGroup.show();
		}
		else {
		    this.alterationArray[i].stapGroup.hide();
		}
	    }
	}
	this.options.parent.alterationlayer.draw();
    },

});

//the circle next to PathHelixItem
var PathHelixHandlerItem = Backbone.View.extend({
    initialize: function() {
	this.sqLength = this.options.graphics.sqLength;
	this.part = this.options.model.getPart();
	this.layer = this.options.parent.backlayer;
	this.helixitem = this.options.helixitem;
	this.helixitem.helixhandler = this;
	this.group = new Kinetic.Group();
	var helixNum = this.options.model.hID;
	var circ = new Kinetic.Circle({
	    x: 2.5*this.sqLength,
	    y: this.helixitem.startY+this.sqLength,
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

	var tempLayer = this.options.parent.templayer;
	this.group.superobj = this;
	this.group.on("mousedown", function(originPos) {
	    var pathTool = this.superobj.options.model.part.currDoc.pathTool;
	    var pPosY = originPos.y;
	    if(pathTool === "select" && tbSelectArray[2]) {
		var zf = this.superobj.options.parent.scaleFactor;
		var dragCirc = new Kinetic.Circle({
		    x: circ.getX(),
		    y: this.superobj.helixitem.startY+this.superobj.sqLength,
		    radius: circ.getRadius(),
		    fill: "transparent",
		    stroke: colours.bluestroke,
		    strokeWidth: 4,
		    draggable: true
		});
		tempLayer.add(dragCirc);
		tempLayer.draw();
		dragCirc.superobj = this.superobj;
		dragCirc.on("mousemove", function(pos) {
		    dragCirc.setY(dragCirc.getY()+(pos.y-pPosY)/zf);
		    pPosY = pos.y;
		    tempLayer.draw();
		});
		dragCirc.on("mouseup", function() {
		    var order = Math.floor((dragCirc.getY()/dragCirc.superobj.sqLength-2)/4);
		    order = Math.min(Math.max(0,order),this.superobj.options.parent.phItemArray.defined.length);
		    if(order-this.superobj.helixitem.order < 0) { //moved upward
			var pharray = this.superobj.options.parent.phItemArray;
			for(var i=0; i<pharray.defined.length; i++) {
			    if(pharray[pharray.defined[i]].order >= order && pharray[pharray.defined[i]].order < this.superobj.helixitem.order) {
				pharray[pharray.defined[i]].order += 1;
				pharray[pharray.defined[i]].updateStartY();
				pharray[pharray.defined[i]].updateStrandY();
			    }
			}
			this.superobj.helixitem.order = order;
		    }
		    else if(order-this.superobj.helixitem.order > 1) {
			var pharray = this.superobj.options.parent.phItemArray;
			for(var i=0; i<pharray.defined.length; i++) {
			    if(pharray[pharray.defined[i]].order < order && pharray[pharray.defined[i]].order > this.superobj.helixitem.order) {
				pharray[pharray.defined[i]].order -= 1;
				pharray[pharray.defined[i]].updateStartY();
				pharray[pharray.defined[i]].updateStrandY();
			    }
			}
			this.superobj.helixitem.order = order-1;
		    }
		    this.superobj.helixitem.updateStartY();
		    this.superobj.helixitem.updateStrandY();
		    this.superobj.options.parent.redrawBack();
		    this.superobj.options.parent.strandlayer.draw();
		    dragCirc.destroy();
		    tempLayer.draw();
		    this.superobj.options.parent.prexoverlayer.destroyChildren();
		    this.superobj.options.parent.part.setActiveVirtualHelix(this.superobj.options.model);
		});
	    }
	});
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
	var parent = this.options.parent;

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
			parent.redrawBack();			
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
			    parent.redrawBack();
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
	        title: "Select color",
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
