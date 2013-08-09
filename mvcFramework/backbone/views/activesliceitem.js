var ActiveSliceItem = Backbone.View.extend({
    initialize: function(){
	this.layer = this.options.parent.activeslicelayer;
	this.panel = this.options.parent.panel;
	this.divLength = this.options.graphics.divLength;
	this.blkLength = this.options.graphics.blkLength;
	this.sqLength = this.options.graphics.sqLength;

	this.initcounter = this.divLength*this.blkLength*this.options.parent.part.getStep()/2;
	this.counter = this.initcounter;
	this.pCounter = this.counter;
	this.top = 3*this.sqLength;
	this.bot = 0;

	this.rect = new Kinetic.Rect({
	    x: 5*this.sqLength+this.counter*this.sqLength,
	    y: this.top,
	    width: this.sqLength,
	    height: 0,
	    fill: colours.orangefill,
	    stroke: "#000000",
	    strokeWidth: 1,
	    opacity: 0.6
	});
	this.counterText = new Kinetic.Text({
	    x: 5*this.sqLength+(this.counter+0.5)*this.sqLength,
	    y: this.top-18,
	    text: this.counter,
	    fontSize: 16,
	    fontFamily: "Calibri",
	    fill: "#000000",
	    });
	this.counterText.setOffset({
	    x: this.counterText.getWidth()/2
	});

	this.group = new Kinetic.Group({
	    draggable: true,
	    dragBoundFunc: function(pos) {
		/*
		  The group is not intended to be draggable; when we want to move its location we change its X in update()
		  But if we don't set draggable to true, we can't call dragmove. This method makes it easier to efficiently send signals.
		*/
		return {
		    x: this.getAbsolutePosition().x,
		    y: this.getAbsolutePosition().y
		}
	    }
	});
	this.group.superobj = this;
	this.group.on("dragmove", function(pos) {
	    var tempCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.superobj.options.parent.scaleFactor-5*this.superobj.sqLength)/this.superobj.sqLength);
	    var tempCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth+this.superobj.panel.scrollLeft)/this.superobj.options.parent.scaleFactor-5*this.superobj.sqLength)/this.superobj.sqLength);
	    this.superobj.adjustCounter(tempCounter); //counter should always be between 0 and grid length
	    if(this.superobj.counter !== this.superobj.pCounter) { //only draws when counter is changed; more efficient
		this.superobj.pCounter = this.superobj.counter;
		this.superobj.update();
		//throw out signals here
		//change the model object.
		this.superobj.options.parent.part.setActiveBaseIndex(this.superobj.counter);
	    }
	});

	this.listenTo(this.options.parent.part.currDoc,cadnanoEvents.moveSliceItemToFirstSignal,this.moveSliceItemToFirstSlot);
	this.listenTo(this.options.parent.part.currDoc,cadnanoEvents.moveSliceItemToLastSignal,this.moveSliceItemToLastSlot);
	this.group.add(this.rect);
	this.group.add(this.counterText);
	this.layer.add(this.group);
    },

    update: function() { //puts group in correct location
        this.counterText.setText(this.counter);
	this.counterText.setOffset({x: this.counterText.getWidth()/2});
	this.group.setX((this.counter-this.initcounter)*this.sqLength);
	this.layer.draw();
    },

    moveSliceItemToFirstSlot: function() {
	if(this.options.parent.phItemArray.defined.length > 0) {
	    this.counter = 0;
	    this.pCounter = this.counter;
	    this.update();
	    this.options.parent.part.setActiveBaseIndex(this.superobj.counter);
	}
    },

    moveSliceItemToLastSlot: function() {
	if(this.options.parent.phItemArray.defined.length > 0) {
	    this.counter = this.divLength*this.blkLength*this.options.parent.part.getStep()-1;
	    this.pCounter = this.counter;
	    this.update();
	    this.options.parent.part.setActiveBaseIndex(this.superobj.counter);
	}
    },

    updateHeight: function() { //makes the bar span through all PathHelixItem
	var numItems = this.options.parent.phItemArray.defined.length;
	if(numItems >= 1){
	    this.group.show();
	    this.bot = 5*this.sqLength+4*this.sqLength*numItems;
	    this.rect.setHeight(this.bot-this.top);
	}
	else {
	    this.group.hide();
	}
	this.layer.draw();
    },

    adjustCounter: function(n) {
	this.counter = Math.min(Math.max(0,n),this.blkLength*this.divLength*this.options.parent.part.getStep()-1);
    },
});
