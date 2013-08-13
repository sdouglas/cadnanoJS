var PreXoverItem = Backbone.View.extend({
    initialize: function(phItem, comp, xPos, isStap, onLeft) {
	this.parent = phItem;
	this.pos = xPos; //position of the item on PathHelixItem
	this.cHelixItem = comp; //complementary PathHelixItem (we don't use StrandItem because it can change)
	this.isScaf = 1-isStap; //1 if true, 0 if false
	this.onLeft = onLeft; //left and right variations
	
	//graphics information
	this.divLength = this.parent.divLength;
	this.blkLength = this.parent.blkLength;
	this.sqLength = this.parent.sqLength;
	this.layer = this.parent.options.parent.prexoverlayer;
	this.centerX = this.parent.startX+(this.pos+0.5)*this.sqLength;
	var clickable; //a PreXoverItem is clickable only if there is a strand at given position of phItem and cHelixItem
	if(this.parent.getStrandItem(this.isScaf,this.pos) && this.cHelixItem.getStrandItem(this.isScaf,this.pos)) {
	    clickable = true;
	    this.colour = colours.bluestroke;
	}
	else {
	    clickable = false;
	    this.colour = colours.lightergraystroke; //greyish
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
	    this.centerY2 = this.centerY+1;
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
	    this.centerY2 = this.centerY-1;
	    pt2y = this.centerY+0.4*this.sqLength;
	    textY = pt2y+0.25*this.sqLength;
	}
	var line1 = new Kinetic.Line({
	    points: [this.centerX, this.centerY, pt1x, this.centerY],
	    stroke: this.colour,
	    strokeWidth: 2
	});
	var line2 = new Kinetic.Line({
	    points: [this.centerX, this.centerY2, this.centerX, pt2y],
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
	text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
	var invisClicker = new Kinetic.Rect({
	    x: this.centerX,
	    y: this.centerY,
	    width: pt1x-this.centerX,
	    height: pt2y-this.centerY,
	    opacity: 0
	});
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

    createXover: function() { //in progress
        var strandSet1,strandSet2;
        if(this.isScaf) {
            strandSet1 = this.parent.options.model.scafStrandSet;
            strandSet2 = this.cHelixItem.options.model.scafStrandSet;
        }
        else {
            strandSet1 = this.parent.options.model.stapStrandSet;
            strandSet2 = this.cHelixItem.options.model.stapStrandSet;
        }
        //now get the strand obj based on the position.
        if((this.onLeft && strandSet1.isDrawn5to3()) || 
           (!this.onLeft && strandSet2.isDrawn5to3()) 
        ){ 
            var strand5p = strandSet1.getStrandAt(this.pos);
            var strand3p = strandSet2.getStrandAt(this.pos);
        }
        else{
            var strand3p = strandSet1.getStrandAt(this.pos);
            var strand5p = strandSet2.getStrandAt(this.pos);
        }
        var part = strandSet1.part;
        var pos = this.pos;
        part.createXover(strand5p,pos,strand3p,pos);
    },
});
