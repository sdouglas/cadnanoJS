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

    createXover: function() { //Note 001; DOES NOT WORK
        var strandSet1,strandSet2;
        if(this.isScaf) strandSet1 = this.parent.options.model.scafStrandSet;
        else strandSet1 = this.parent.options.model.stapStrandSet;
        if(this.isScaf) strandSet2 = this.cHelixItem.options.model.scafStrandSet;
        else strandSet2 = this.cHelixItem.options.model.stapStrandSet;
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
        console.log(strand5p);
        console.log(strand3p);
        var part = strandSet1.part;
        var pos = this.pos;
        part.createXover(strand5p,pos,strand3p,pos);
                 },
        /*
	    if((this.parent.options.model.hID+this.isScaf)%2) { //top, aka 5->3
		this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
		this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos+1);
>>>>>>> sudhanshu-aug5
	    }
	    else if((this.parent.options.model.hID+this.isScaf)%2) { //parent strand 5->3 (upper helix)
		var canBreakP = this.parent.getStrandItem(this.isScaf,this.pos).canBreakStrand(this.pos);
		var canBreakC = this.cHelixItem.getStrandItem(this.isScaf,this.pos).canBreakStrand(this.pos+1);
		if(this.pos === this.parent.getStrandItem(this.isScaf,this.pos).xEnd && canBreakC) { //parent strand's xover site is an endpoint (but not cStrand's)
		    this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos+1);
		    canCreate = true;
		}
		else if(this.pos === this.cHelixItem.getStrandItem(this.isScaf,this.pos).xEnd && canBreakP) { //complementary strand's site is an endpoint (but not parent's)
		    this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
		    canCreate = true;
		}
		else if(this.parent.getStrandItem(canBreakP && canBreakC)) { //no endpoints
		    this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
		    this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos+1);
		    canCreate = true;
		}
	    }
	    else { //parent strand 3->5 (lower helix)
		var canBreakP = this.parent.getStrandItem(this.isScaf,this.pos).canBreakStrand(this.pos+1);
		var canBreakC = this.cHelixItem.getStrandItem(this.isScaf,this.pos).canBreakStrand(this.pos);
		if(this.pos === this.parent.getStrandItem(this.isScaf,this.pos).xEnd && canBreakC) { //parent strand's xover site is an endpoint (but not cStrand's)
		    this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
		    canCreate = true;
		}
		else if(this.pos === this.cHelixItem.getStrandItem(this.isScaf,this.pos).xEnd && canBreakP) { //complementary strand's site is an endpoint (but not parent's)
		    this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos+1);
		    canCreate = true;
		}
		else if(canBreakP && canBreakC) { //no endpoints
		    this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos+1);
		    this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
		    canCreate = true;
		}
	    }
	    if(canCreate) {
		this.parent.getStrandItem(this.isScaf,this.pos).endItemR.createXover();
		this.cHelixItem.getStrandItem(this.isScaf,this.pos).endItemR.createXover();
		this.parent.options.parent.part.setActiveVirtualHelix(this.parent.options.model);
	    }
<<<<<<< HEAD
	}
	else { //onRight
	    if(this.pos === this.parent.getStrandItem(this.isScaf,this.pos).xStart && this.pos === this.cHelixItem.getStrandItem(this.isScaf,this.pos).xStart) { //both sites are endpoints
		canCreate = true;
	    }
	    else if((this.parent.options.model.hID+this.isScaf)%2) { //top, aka 5->3
		var canBreakP = this.parent.getStrandItem(this.isScaf,this.pos).canBreakStrand(this.pos-1);
		var canBreakC = this.cHelixItem.getStrandItem(this.isScaf,this.pos).canBreakStrand(this.pos);
		if(this.pos === this.parent.getStrandItem(this.isScaf,this.pos).xStart && canBreakC) { //parent strand's xover site is an endpoint (but not cStrand's)
		    this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
		    canCreate = true;
		}
		else if(this.pos === this.cHelixItem.getStrandItem(this.isScaf,this.pos).xStart && canBreakP) { //complementary strand's site is an endpoint (but not parent's)
		    this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos-1);
		    canCreate = true;
		}
		else if(canBreakP && canBreakC) { //no endpoints
		    this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos-1);
		    this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
		    canCreate = true;
		}
=======
        */
	    /*
	      After merge and "Note 001" is taken care of:
	      this.parent.leftStrandItem.endItemR.createXover();
	      this.cHelixItem.leftStrandItem.endItemR.createXover();
	      (replace leftStrandItem with correct code)
	    */
        /*
	    if((this.parent.options.model.hID+this.isScaf)%2) { //top, aka 5->3
		this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos-1);
		this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
>>>>>>> sudhanshu-aug5
	    }
	    else { //bottom, aka 3->5
		var canBreakP = this.parent.getStrandItem(this.isScaf,this.pos).canBreakStrand(this.pos);
		var canBreakC = this.cHelixItem.getStrandItem(this.isScaf,this.pos).canBreakStrand(this.pos-1);
		if(this.pos === this.parent.getStrandItem(this.isScaf,this.pos).xStart && canBreakC) { //parent strand's xover site is an endpoint (but not cStrand's)
		    this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos-1);
		    canCreate = true;
		}
		else if(this.pos === this.cHelixItem.getStrandItem(this.isScaf,this.pos).xStart && canBreakP) { //complementary strand's site is an endpoint (but not parent's)
		    this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
		    canCreate = true;
		}
		else if(canBreakP && canBreakC) { //no endpoints
		    this.parent.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos);
		    this.cHelixItem.getStrandItem(this.isScaf,this.pos).breakStrand(this.pos-1);
		    canCreate = true;
		}
	    }
	    if(canCreate) {
		this.parent.getStrandItem(this.isScaf,this.pos).endItemL.createXover();
		this.cHelixItem.getStrandItem(this.isScaf,this.pos).endItemL.createXover();
		this.parent.options.parent.part.setActiveVirtualHelix(this.parent.options.model);
	    }
<<<<<<< HEAD
	}
=======
        */
	    /*
	      After merge and "Note 001" is taken care of:
	      this.parent.rightStrandItem.endItemL.createXover();
	      this.cHelixItem.rightStrandItem.endItemL.createXover();
	      (replace leftStrandItem with correct code)
    },
	    */

});
