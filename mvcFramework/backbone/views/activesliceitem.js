var ActiveSliceItem = Backbone.View.extend({
    initialize: function(){
	this.layer = this.options.parent.activeslicelayer;
	this.divLength = this.options.graphics.divLength;
	this.blkLength = this.options.graphics.blkLength;
	this.sqLength = this.options.graphics.sqLength;

	this.initcounter = 0;
	this.counter = this.initcounter;
	this.top = 3*this.sqLength;
	this.bot = 0;

	this.rect = new Kinetic.Rect({
	    x: 5*this.sqLength+this.counter*this.sqLength+2*Math.floor(this.counter/this.divLength),
	    y: this.top,
	    width: this.sqLength,
	    height: 0,
	    fill: colours.orangefill,
	    stroke: "#000000",
	    strokeWidth: 1,
	    opacity: 0.7
	});
	this.counterText = new Kinetic.Text({
	    x: 5*this.sqLength+(this.counter+0.5)*this.sqLength+2*Math.floor(this.counter/this.divLength),
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
	});
	this.group.superobj = this;
	this.group.setDragBoundFunc(function(pos) {
	    var counter = this.superobj.counter;
	    //changing text settings; these lines are here so it can be in sync with the bar
	    this.superobj.counterText.setText(counter);
	    this.superobj.counterText.setOffset({x: this.superobj.counterText.getWidth()/2});
	    //limit slidebar to be right on top of bases
	    return {
		x: ((this.superobj.counter-this.superobj.initcounter)*this.superobj.sqLength
		    +2*Math.floor(this.superobj.counter/this.superobj.divLength)
		    -2*Math.floor(this.superobj.initcounter/this.superobj.divLength))*this.superobj.options.parent.scaleFactor,
		y: this.getAbsolutePosition().y
	    }
	});
	this.group.on("dragmove", function(pos) {
	    var correctedSqLength = this.superobj.sqLength+2/this.superobj.divLength;
	    var tempCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.superobj.options.parent.scaleFactor-5*this.superobj.sqLength)/correctedSqLength);
	    this.superobj.adjustCounter(tempCounter);

        //change the model object.
        this.superobj.options.parent.part.setActiveBaseIndex(this.superobj.counter);
	});

	this.group.add(this.rect);
	this.group.add(this.counterText);
	this.layer.add(this.group);
	console.log(this.options.parent.part.el);
    },

    updateHeight: function() {
	this.bot = 5*this.sqLength+4*this.sqLength*this.options.parent.phItemArray.length;
	this.rect.setHeight(this.bot-this.top);
	this.layer.draw();
    },

    adjustCounter: function(n) {
	this.counter = Math.min(Math.max(0,n),this.blkLength*this.divLength*this.options.parent.part.getStep()-1);
    },
});
