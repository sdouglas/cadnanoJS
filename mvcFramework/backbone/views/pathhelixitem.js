var PathHelixSetItem = Backbone.View.extend({
    initialize: function(){
	//pathTool variables
	this.selectedItems = new Array();
	this.selectedItemsTemp = new Array();
	this.pencilendpoint = undefined; //used for pencil
	this.paintcolor = colours.bluestroke; //used for paint
	//PathHelixSetItem should contains variables that multiple sub-classes need
        this.handler = this.options.handler;
        this.part = this.options.part;
	this.panel = this.options.handler.handler.getContainer(); //panel is used to account for scrolling

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
	this.graphicsSettings = { //only for honeycomb; for square divLength should be 8 and blkLength should be 4
	    sqLength: 20,
	    divLength: 7,
	    blkLength: 3
	};

	//scale factor
	this.userScale = 1; //user can control this with +/- (see documentitem.js)
	this.autoScale = Math.min(1,innerLayout.state.center.innerWidth/
				  (this.graphicsSettings.sqLength*(8+2*this.graphicsSettings.divLength*this.graphicsSettings.blkLength))); //adjusted by system
	this.scaleFactor = this.autoScale * this.userScale;
	this.zoom();

	//active slice item is the reddish movable bar
	this.activesliceItem = new ActiveSliceItem({
	    handler: this.handler,
	    parent: this,
	    graphics: this.graphicsSettings
	});
	this.c2Item = new ColorChangeItem({
	    parent: this,
	});
	this.pbcItem = new PathBaseChangeItem({
	    handler: this.handler,
	    parent: this,
	    graphics: this.graphicsSettings
	});
	this.buttonlayer.hide();
	this.activeslicelayer.hide();
    },
    events: {
        "mousemove" : "onMouseMove",
    },
    render: function(){
	if(!this.collection.length) { //no virtual helix
	    this.buttonlayer.hide();
	    this.activeslicelayer.hide();
	}
	else {
	    this.buttonlayer.show();
	    this.activeslicelayer.show();
	}
	//variables that the items created in foreach loop can access
        var h = this.handler;
	var dims = this.graphicsSettings;
	dims.grLength = dims.blkLength*dims.divLength*this.part.getStep();
	var helixset = this;
	var pharray = this.phItemArray;
	//for each VirtualHelixItem, we create a path helix and a path helix handler
        this.collection.each(function(vh){
	    if(pharray[vh.id]) return; //create PathHelixItem only if it is new - increase performance
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

	//changing stage size
	this.adjustStageSize();
	this.backlayer.draw();
    },

    removeHelix: function(id) {
	var idx;
	if(this.phItemArray[id]) { //can't remove an nonexistent item
	    var order = this.phItemArray[id].order;
	    for(var i=0; i<this.phItemArray.defined.length; i++) {
		var phItem = this.phItemArray[this.phItemArray.defined[i]];
		if(phItem.order > order) {
		    phItem.order -= 1; //everything after the deleted helix needs to be shifted up
		    phItem.updateY();
		}
		else if(phItem.order === order) {
		    idx = i;
		}
	    }
	    this.phItemArray[id].group.destroy();
	    this.phItemArray[id] = undefined;
	    this.phItemArray.defined.splice(idx,1);
	    this.redrawBack();
	}
    },

    //redraw every layer, now obsolete
    redrawLayers: function() {
        this.backlayer.draw();
	this.prexoverlayer.draw();
	this.activeslicelayer.draw();
	this.buttonlayer.draw();
	this.strandlayer.draw();
	this.alterationlayer.draw();
	this.finallayer.draw();
    },

    adjustStageSize: function() {
	var newWidth = this.graphicsSettings.sqLength*(8+this.part.getStep()*this.graphicsSettings.divLength*this.graphicsSettings.blkLength)*this.scaleFactor;
	var newHeight = this.graphicsSettings.sqLength*(7+4*this.phItemArray.defined.length)*this.scaleFactor;
	this.handler.handler.setSize(Math.max(newWidth, innerLayout.state.center.innerWidth),
				     Math.max(newHeight, innerLayout.state.center.innerHeight));
    },

    zoom: function(skipAdjustment) {
	this.scaleFactor = this.autoScale * this.userScale;
	this.backlayer.setScale(this.scaleFactor);
	this.prexoverlayer.setScale(this.scaleFactor);
	this.activeslicelayer.setScale(this.scaleFactor);
	this.buttonlayer.setScale(this.scaleFactor);
	this.strandlayer.setScale(this.scaleFactor);
	this.alterationlayer.setScale(this.scaleFactor);
	this.finallayer.setScale(this.scaleFactor);
	this.templayer.setScale(this.scaleFactor);
	if(!skipAdjustment) {
	    this.adjustStageSize();
	}
    },

    //redrawing the items in back layer
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

    getPathHelixItem: function(id){
        return this.phItemArray[id];
    },
});

//the long rectangular base grid
var PathHelixItem = Backbone.View.extend ({
    initialize: function(){
	this.panel = this.options.parent.panel;
	this.layer = this.options.parent.backlayer;
	//The group will not move even when dragged (because of dragBoundFunc), but we set draggable to true
	//so that we can use dragstart/dragmove/dragend functions, which are superior to mousedown/mousemove/
	//mouseup because drag functions work even when the mouse is outside of the object. However, drag
	//only works with existing objects. (aka you cannot immediately call drag func of a newly-made obj)
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
        this.alterationArray = new Array(); //stores inserts and skips

	//drawing each little square
	for(var i=0; i<this.grLength; i++) {
	    for(var j=0; j<2; j++) {
		var rect = new Kinetic.Rect({
		    x: this.startX+i*this.sqLength,
		    y: this.startY+j*this.sqLength,
		    width: this.sqLength,
		    height: this.sqLength,
		    fill: colours.white,
		    stroke: colours.lightgraystroke,
		    strokeWidth: 2,
		});
		this.group.add(rect);
	    }
	    if(i%7 == 0) { //divider lines are blacker
		var divLineXStart = this.startX+i*this.sqLength;
		var divLine = new Kinetic.Line({
		    points: [divLineXStart,this.startY-1,divLineXStart,this.startY+2*this.sqLength+1],
		    stroke: colours.graystroke,
		    strokeWidth: 2
		});
		this.group.add(divLine);
	    }
	}
	this.layer.add(this.group);
	this.connectSignalsSlots();
	
	var self = this;
	var zf;
	var yLevel;
	var strandInitCounter,strandCounter,strandPCounter;
	var stItemImage;
	//mouse function: dragging on helix = new StrandItem
	//This is for the pencil object to drag and draw.
	this.group.superobj = this;
	this.group.on("mousedown", function() {
	    this.superobj.options.parent.prexoverlayer.destroyChildren();
	    this.superobj.options.parent.part.setActiveVirtualHelix(this.superobj.options.model);
	});
	this.group.on("dragstart", function(pos) {
	    if(this.superobj.options.model.part.currDoc.pathTool === "pencil") {
		zf = this.superobj.options.parent.scaleFactor;
		yLevel = Math.floor(((pos.y-54+this.superobj.panel.scrollTop)/zf-this.superobj.startY)/this.superobj.sqLength);
		strandInitCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth+this.superobj.panel.scrollLeft)/zf-this.superobj.startX)/this.superobj.sqLength);
		strandCounter = strandInitCounter;
		strandPCounter = strandCounter;
		stItemImage = new StrandItemImage(this.superobj, yLevel, strandCounter, strandInitCounter); //see stranditem.js for more info on this class
	    }
	});
	this.group.on("dragmove", function(pos) {
	    if(this.superobj.options.model.part.currDoc.pathTool === "pencil") {
		zf = this.superobj.options.parent.scaleFactor;
		strandCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth+this.superobj.panel.scrollLeft)/zf-this.superobj.startX)/this.superobj.sqLength);
		strandCounter = adjustCounter(strandCounter);
		if(strandCounter !== strandPCounter) {
		    stItemImage.remove();
		    stItemImage = new StrandItemImage(this.superobj, yLevel, strandCounter, strandInitCounter);
		    strandPCounter = strandCounter;
		}
		function adjustCounter(n) {
		    var strandSet;
		    if(yLevel^self.options.model.isEvenParity()) { //^ is xor (exclusive or)
			strandSet = self.options.model.scafStrandSet;
		    }
		    else {
			strandSet = self.options.model.stapStrandSet;
		    }
		    minMaxIndices = strandSet.getLowHighIndices(stItemImage); //a hack as the param is normally a strand (model object)
		    return Math.min(Math.max(n,minMaxIndices[0]),minMaxIndices[1]);
		}
	    }
	});
	this.group.on("dragend", function() {
	    if(this.superobj.options.model.part.currDoc.pathTool === "pencil" && Math.abs(strandCounter-strandInitCounter) >= 2) { //minimum length limit from cadnano2
		stItemImage.remove();
		this.superobj.options.parent.templayer.draw();
		//Call model with create strand.
		var left = Math.min(strandCounter,strandInitCounter); //unlike StrandItemImage, you have to specify what is left and what is right for Strand and StrandItem
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
	});
    },

    /**
      @params {isScaf} determines which strand set we will be using
      @params {n} is the position on PathHelixItem
      @params {indexMode} returns the index of that strand in item array
      returns a StrandItem or undefined if no StrandItem is found
     */
    getStrandItem: function(isScaf, n, indexMode) {
	var stItemArray;
	if(isScaf) {
	    stItemArray = this.scafItemArray;
	}
	else {
	    stItemArray = this.stapItemArray;
	}
	for(var i=0; i<stItemArray.length; i++) {
	    if(stItemArray[i] && stItemArray[i].xStart <= n && stItemArray[i].xEnd >= n) {
		if(indexMode) {return i;}
		return stItemArray[i];
	    }
	}
	return undefined;
    },

    //updates the Y position of items after moving PathHelixHandlerItem
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
	    if(this.alterationArray[i]) {
		var group = this.alterationArray[i].skipInsertGroup;
		group.setY(group.getY()+this.startY-oldY);
	    }
        }
    },

    //redrawing a particular PathHelixItem
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
		    fill: colours.white,
		    stroke: colours.lightgraystroke,
		    strokeWidth: 2,
		});
		this.group.add(rect);
	    }
	    if(i%7 == 0) { //divider lines are blacker
		var divLineXStart = this.startX+i*this.sqLength;
		var divLine = new Kinetic.Line({
		    points: [divLineXStart,this.startY-1,divLineXStart,this.startY+2*this.sqLength+1],
		    stroke: colours.graystroke,
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
	    this
	);
	if(stItem.isScaf) {
	    this.scafItemArray.push(stItem);
	}
	else {
	    this.stapItemArray.push(stItem);
	}
    },

    strandRemovedSlot: 
    function(strand) {
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
		var scafHidden = false;
		var stapHidden = false;
		if(this.getStrandItem(true, i)) { //if scaffold strand exists
		    if(this.alterationArray[i] instanceof InsertItem) {
			//change InsertItem's color to match the StrandItem
			this.alterationArray[i].scafGroup.triangle.setStroke(this.getStrandItem(true, i).itemColor);
		    }
		    this.alterationArray[i].scafGroup.show();
		}
		else {
		    this.alterationArray[i].scafGroup.hide();
		    scafHidden = true;
		}
		if(this.getStrandItem(false, i)) { //if staple strand exists
		    if(this.alterationArray[i] instanceof InsertItem) {
			this.alterationArray[i].stapGroup.triangle.setStroke(this.getStrandItem(false, i).itemColor);
		    }
		    this.alterationArray[i].stapGroup.show();
		}
		else {
		    this.alterationArray[i].stapGroup.hide();
		    stapHidden = true;
		}
		if(scafHidden && stapHidden) { //remove if neither strand exists
		    this.alterationArray[i].skipInsertGroup.destroy();
		    this.alterationArray[i] = undefined;
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
        this.group = new Kinetic.Group({
	    draggable: true,
	    dragBoundFunc: function(pos) {
		return {
		    x: this.getAbsolutePosition().x,
		    y: this.getAbsolutePosition().y
		}
	    }
	});
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
	    fill: colours.black,
	});
	helixNumText.setOffset({
	    x: helixNumText.getWidth()/2
	});
        //end: number on the circle

	//mouse functions for handler selection
	var tempLayer = this.options.parent.templayer;
	var pPosY; //previous Y position
	var zf; //zoom factor
	var dragCirc; //temporary circle to show handler location
	this.group.superobj = this;
	this.group.on("mousedown", function(pos) { //reason for mousedown: we want dragCirc to show as soon as we press mouse
	    var pathTool = this.superobj.options.model.part.currDoc.pathTool;
	    pPosY = pos.y;
	    if(pathTool === "select" && tbSelectArray[2]) {
		zf = this.superobj.options.parent.scaleFactor;
		dragCirc = new Kinetic.Circle({
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
	    }
	});
	this.group.on("dragmove", function(pos) {
	    var pathTool = this.superobj.options.model.part.currDoc.pathTool;
	    if(pathTool === "select" && tbSelectArray[2]) {
		dragCirc.setY(dragCirc.getY()+(pos.y-pPosY)/zf); //move dragCirc by comparing its location to previous location
		pPosY = pos.y;
		tempLayer.draw();
	    }
	});
	this.group.on("dragend", function() {
	    var pathTool = this.superobj.options.model.part.currDoc.pathTool;
	    if(pathTool === "select" && tbSelectArray[2]) {
		var order = Math.floor((dragCirc.getY()/this.superobj.sqLength-2)/4);
		order = Math.min(Math.max(0,order),this.superobj.options.parent.phItemArray.defined.length);
		if(order-this.superobj.helixitem.order < 0) { //handler moved upward
		    var pharray = this.superobj.options.parent.phItemArray;
		    for(var i=0; i<pharray.defined.length; i++) {
			//only helixes between the old and new location needs to be changed
			if(pharray[pharray.defined[i]].order >= order && pharray[pharray.defined[i]].order < this.superobj.helixitem.order) {
			    pharray[pharray.defined[i]].order += 1;
			    pharray[pharray.defined[i]].updateY();
			}
		    }
		    this.superobj.helixitem.order = order;
		}
		else if(order-this.superobj.helixitem.order > 1) { //handler moved downward
		    var pharray = this.superobj.options.parent.phItemArray;
		    for(var i=0; i<pharray.defined.length; i++) {
			//only helixes between the old and new location needs to be changed
			if(pharray[pharray.defined[i]].order < order && pharray[pharray.defined[i]].order > this.superobj.helixitem.order) {
			    pharray[pharray.defined[i]].order -= 1;
			    pharray[pharray.defined[i]].updateY();
			}
		    }
		    this.superobj.helixitem.order = order-1;
		}
		//changing the moved helix
		this.superobj.helixitem.updateY();
		this.superobj.options.parent.redrawBack();
		this.superobj.options.parent.strandlayer.draw();
		dragCirc.destroy();
		dragCirc = undefined;
		tempLayer.draw();
		this.superobj.options.parent.prexoverlayer.destroyChildren();
		this.superobj.options.parent.part.setActiveVirtualHelix(this.superobj.options.model);
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
		    var canShrink = true; //cannot shrink if there is a strand in the removed range
		    var low = baseperblk*(part.getStep()-1);
		    var high = baseperblk*part.getStep();
		    for(var i=0; i<parent.phItemArray.defined.length; i++) {
			var vh = parent.phItemArray[parent.phItemArray.defined[i]].options.model;
			if(vh.scafStrandSet.hasStrandAt(low,high) || vh.stapStrandSet.hasStrandAt(low,high)) {
			    canShrink = false;
			}
		    }
		    if(canShrink) {
			part.setStep(part.getStep()-1);
			parent.redrawBack();
		    }			
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
		    var baseInc = parseInt(baseIncrease,10); //baseIncrease is a string, not a number
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

//the box next to arrows; once clicked, a page (cadnanoPaint.html) will pop up with color picker and send value back to main webpage
var ColorChangeItem = Backbone.View.extend({
    initialize: function() {
	var layer = this.options.parent.buttonlayer;
	var rect = new Kinetic.Rect({ //small box next to arrows
	    x: 65,
	    y: 5,
	    width: 20,
	    height: 20,
	    stroke: colours.black,
	    strokeWidth: 1,
	    fill: this.options.parent.paintcolor
	});
	rect.superobj = this;
	rect.on("click", function(pos) { //someone fix the duplicate dialog bug (it is also in stranditem.js)
	    //this function makes use of jQuery UI dialog
	    window.localStorage.setItem("cadnanoPaint",rect.superobj.options.parent.paintcolor); //the other page will load current color into picker
	    var newDialog = $('<link rel="stylesheet" href="ui/css/jquery-ui/jquery.ui-1.9.2.min.css"><div><iframe src="cadnanoPaint.html" width="195" height="224"></div>');
	    $(newDialog).dialog({
		width: 226,
		height: 344,
		modal: true,
	        title: "Select color",
		show: "clip",
		hide: "clip",
		buttons: {
		    OK: function() {update(); $(newDialog).dialog("close");},
		    Cancel: function() {$(newDialog).dialog("close");}
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
