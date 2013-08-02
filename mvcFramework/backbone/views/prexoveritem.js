var PreXoverItem = Backbone.View.extend({
	initialize: function(phItem, xPos, variety, comp) {
	this.parent = phItem;
	this.pos = xPos;
	this.cStrand = comp;
	this.variety = variety;

        this.divLength = this.parent.divLength;
        this.blkLength = this.parent.blkLength;
        this.sqLength = this.parent.sqLength;

	this.layer = this.parent.options.parent.prexoverlayer;
	this.centerX = this.parent.startX+(this.pos+0.5)*this.sqLength;
	if(this.variety <= 2) {
	    this.centerY = this.parent.startY-0.2*this.sqLength;
	}
	else {
	    this.centerY = this.parent.startY+2.2*this.sqLength;
	}

	this.group = new Kinetic.Group();
	//FREAKING ROTATION DOESNT WORK
	var arm = 0.5*this.sqLength;
	var line1 = new Kinetic.Line({
	    points: [this.centerX, this.centerY, this.centerX+arm*Math.cos(-Math.PI/2*(variety-1)), this.centerY+arm*Math.sin(-Math.PI/2*(variety-1))],
	    stroke: "#B0B0B0",
	    strokeWidth: 2
	});
	var line2 = new Kinetic.Line({
	    points: [this.centerX, this.centerY, this.centerX+arm*Math.cos(-Math.PI/2*variety), this.centerY+arm*Math.sin(-Math.PI/2*variety)],
	    stroke: "#B0B0B0",
	    strokeWidth: 2
	});
	var textY;
	if(this.variety <= 2) {
	    textY = this.centerY-0.7*this.sqLength;
	}
	else {
	    textY = this.centerY+0.75*this.sqLength;
	}
	var text = new Kinetic.Text({
	    x: this.centerX,
	    y: textY,
	    text: this.cStrand.hID,
	    fontSize: this.sqLength*0.5,
	    fontFamily: "Calibri",
	    fill: "#B0B0B0",
	});
	text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
	this.group.add(line1);
	this.group.add(line2);
	this.group.add(text);
	this.layer.add(this.group);
	this.layer.draw();

	this.group.on("click", function() {
		
	});
    },
});