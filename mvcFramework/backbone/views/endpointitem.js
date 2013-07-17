var EndPointItem = Backbone.View.extend({
    initialize: function(phi, baseX, baseY, type) {
	//accessing other objects
	this.strand = undefined;
	this.phItem = phi;
	this.layer = this.phItem.options.parent.strandlayer;
	//graphics
	this.divLength = this.phItem.options.graphics.divLength;
	this.blkLength = this.phItem.options.graphics.blkLength;
	this.sqLength = this.phItem.options.graphics.sqLength;
	this.centerX = this.phItem.startX+(baseX+0.5)*this.phItem.sqLength+2*Math.floor(baseX/this.phItem.divLength);
	this.centerY = this.phItem.startY+(baseY+0.5)*this.phItem.sqLength;
	//counters
	this.initcounter = baseX;
	this.counter = this.initcounter;
	this.pCounter = this.counter;
	//misc. properties
	this.endtype = type;
	this.parity = (this.phItem.options.model.hID)%2;
	//vertices of the shape
	var polypts;
	if(type === 3) { //3' end: triangle
	    polypts = [this.centerX-(2*this.parity-1)*this.sqLength*0.3,this.centerY,
		       this.centerX+(2*this.parity-1)*this.sqLength*0.5,this.centerY-this.sqLength*0.5,
		       this.centerX+(2*this.parity-1)*this.sqLength*0.5,this.centerY+this.sqLength*0.5];
	}
	else if(type === 5) { //5' end: square
	    //reason I didn't use Kinetic.Rect: its getX() works differently and shows the shape at wrong position
	    polypts = [this.centerX-this.sqLength*0.2-this.sqLength*this.parity*0.3,this.centerY-this.sqLength*0.35,
		       this.centerX-this.sqLength*0.2-this.sqLength*this.parity*0.3,this.centerY+this.sqLength*0.35,
		       this.centerX+this.sqLength*0.5-this.sqLength*this.parity*0.3,this.centerY+this.sqLength*0.35,
		       this.centerX+this.sqLength*0.5-this.sqLength*this.parity*0.3,this.centerY-this.sqLength*0.35];
	}
	else { //typo
	    alert(type+"\' end does not exist!");
	    throw "stop execution";
	}

	this.shape = new Kinetic.Polygon({
	    points: polypts,
	    fill: "#4444FF",
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
	this.shape.on("dragmove", function(pos) {
	    var correctedSqLength = this.superobj.sqLength+2/this.superobj.divLength;
	    var tempCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.superobj.phItem.options.parent.scaleFactor-5*this.superobj.sqLength)/correctedSqLength);
	    this.superobj.adjustCounter(tempCounter);
	    if(this.superobj.counter !== this.superobj.pCounter) {
		this.superobj.pCounter = this.superobj.counter;
		this.superobj.update();
		//throw out signals here
	    }
	});
	this.layer.add(this.shape);
	this.layer.draw();
    },

    update: function() {
	this.shape.setX((this.counter-this.initcounter)*this.sqLength+2*Math.floor(this.counter/this.divLength)-2*Math.floor(this.initcounter/this.divLength));
	this.layer.draw();
    },

    adjustCounter: function(n) {
	this.counter = Math.min(Math.max(0,n),this.blkLength*this.divLength*this.phItem.options.parent.part.getStep()-1);
    },
});
