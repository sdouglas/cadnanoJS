var PreXoverItem = Backbone.View.extend({
    initialize: function(phItem, comp, xPos, isStap, onLeft) {
	this.parent = phItem;
	this.pos = xPos;
	this.cHelixItem = comp;
	this.isScaf = 1-isStap; //1 if true, 0 if false
	this.onLeft = onLeft;
	
        this.divLength = this.parent.divLength;
        this.blkLength = this.parent.blkLength;
        this.sqLength = this.parent.sqLength;
	this.layer = this.parent.options.parent.prexoverlayer;
	this.centerX = this.parent.startX+(this.pos+0.5)*this.sqLength;
	var clickable;

	if(this.parent.getStrandItem(this.isScaf,this.pos) && this.cHelixItem.getStrandItem(this.isScaf,this.pos)) {
	    clickable = true;
	    this.colour = colours.bluestroke;
	}
	else {
	    clickable = false;
	    this.colour = "#B0B0B0";
	}

	this.group = new Kinetic.Group();
	var pt1x,pt2y,textY;
	if((this.parent.options.model.hID+this.isScaf)%2) { //top
	    if(this.onLeft) {
		pt1x = this.centerX-0.5*this.sqLength;
	    }
	    else {
		pt1x = this.centerX+0.5*this.sqLength;
	    }
	    this.centerY = this.parent.startY-0.15*this.sqLength;
	    pt2y = this.centerY-0.4*this.sqLength;
	    textY = pt2y-0.25*this.sqLength;
	}
	else { //bottom
	    if(this.onLeft) {
		pt1x = this.centerX-0.5*this.sqLength;
	    }
	    else {
		pt1x = this.centerX+0.5*this.sqLength;
	    }
	    this.centerY = this.parent.startY+2.15*this.sqLength;
	    pt2y = this.centerY+0.4*this.sqLength;
	    textY = pt2y+0.25*this.sqLength;
	}
	var line1 = new Kinetic.Line({
	    points: [this.centerX, this.centerY, pt1x, this.centerY],
	    stroke: this.colour,
	    strokeWidth: 2
	});
	var line2 = new Kinetic.Line({
	    points: [this.centerX, this.centerY, this.centerX, pt2y],
	    stroke: this.colour,
	    strokeWidth: 2
	});
	var text = new Kinetic.Text({
	    x: this.centerX,
	    y: textY,
	    text: this.cHelixItem.options.model.hID,
	    fontSize: this.sqLength*0.5,
	    fontFamily: "Calibri",
	    fill: this.colour,
	});
	var invisClicker = new Kinetic.Rect({
	    x: this.centerX,
	    y: this.centerY,
	    width: pt1x-this.centerX,
	    height: pt2y-this.centerY,
	    opacity: 0
	});
	text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
	this.group.add(line1);
	this.group.add(line2);
	this.group.add(text);
	this.group.add(invisClicker);
	this.layer.add(this.group);

	this.group.superobj = this;
	this.group.on("click", function() {
	    if(clickable) {
		this.superobj.createXover();
	    }
	});
    },

    createXover: function() {
	if(this.onLeft) {
	    if((this.parent.options.model.hID+this.isScaf)%2) { //top, aka 5->3
		this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
		this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos+1);
	    }
	    else { //bottom, aka 3->5
		this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos+1);
		this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
	    }
	    this.parent.getStrandItem(this.isScaf,this.pos).endItemR.createXover();
	    this.cHelixItem.getStrandItem(this.isScaf,this.pos).endItemR.createXover();
	    this.parent.options.parent.part.setActiveVirtualHelix(this.parent.options.model);
	}
	else {
	    if((this.parent.options.model.hID+this.isScaf)%2) { //top, aka 5->3
		this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos-1);
		this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
	    }
	    else { //bottom, aka 3->5
		this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
		this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos-1);
	    }
	    this.parent.getStrandItem(this.isScaf,this.pos).endItemL.createXover();
	    this.cHelixItem.getStrandItem(this.isScaf,this.pos).endItemL.createXover();
	    this.parent.options.parent.part.setActiveVirtualHelix(this.parent.options.model);
	}
    },

});