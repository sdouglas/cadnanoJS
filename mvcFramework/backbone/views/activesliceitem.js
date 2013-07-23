var ActiveSliceItem = Backbone.View.extend({
    initialize: function(){
	this.layer = this.options.parent.activeslicelayer;
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
	    y: -2,
	    width: this.sqLength,
	    height: 0,
	    fill: colours.orangefill,
	    stroke: "#000000",
	    strokeWidth: 1,
	    opacity: 0.6
	});
	this.counterText = new Kinetic.Text({
	    x: 5*this.sqLength+(this.counter+0.5)*this.sqLength,
	    y: -2-18,
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
	    this.superobj.adjustCounter(tempCounter); //counter should always be between 0 and grid length
	    if(this.superobj.counter !== this.superobj.pCounter) { //only draws when counter is changed; more efficient
		this.superobj.pCounter = this.superobj.counter;
		this.superobj.update();
		//throw out signals here
        //change the model object.
        this.superobj.options.parent.part.setActiveBaseIndex(this.superobj.counter);
	    }
	});

	this.group.add(this.rect);
	this.group.add(this.counterText);
	this.layer.add(this.group);
	//console.log(this.options.parent.el.scrollTop); //if one day we need to account for scrolling
    },

    update: function() { //puts group in correct location
        this.counterText.setText(this.counter);
	this.counterText.setOffset({x: this.counterText.getWidth()/2});
	this.group.setX((this.counter-this.initcounter)*this.sqLength);
	this.layer.draw();
    },

    updateHeight: function() { //makes the bar span through all PathHelixItem
	if(this.options.parent.phItemArray.length === 1) {
	    this.rect.setY(this.top);
	    this.counterText.setY(this.top-18);
	}
	this.bot = 5*this.sqLength+4*this.sqLength*this.options.parent.phItemArray.length;
	this.rect.setHeight(this.bot-this.top);
	this.layer.draw();
    },

    adjustCounter: function(n) {
	this.counter = Math.min(Math.max(0,n),this.blkLength*this.divLength*this.options.parent.part.getStep()-1);
    },
});
