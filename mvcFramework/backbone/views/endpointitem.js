var EndPointItem = Backbone.View.extend({
    initialize: function(strand, dir, type) {
	//accessing other objects
	this.parent = strand;
	this.phItem = this.parent.parent;
	this.layer = this.parent.layer;
	//temporary layer that will be used for fast rendering
	this.tempLayer = new Kinetic.Layer();
	this.tempLayer.setScale(this.phItem.options.parent.scaleFactor);
	this.phItem.options.handler.handler.add(this.tempLayer);
	//graphics
	this.divLength = this.parent.divLength;
	this.blkLength = this.parent.blkLength;
	this.sqLength = this.parent.sqLength;
	//counters
	if(dir === "L") {
	    this.initcounter = this.parent.xStart;
	}
	else if(dir === "R") {
	    this.initcounter = this.parent.xEnd;
	}
	this.counter = this.initcounter;
	this.pCounter = this.counter;
	//starting position
	this.centerX = this.parent.parent.startX+(this.counter+0.5)*this.sqLength;
	this.centerY = this.parent.yCoord;
	//misc. properties
	this.prime = type;
	this.parity = (this.phItem.options.model.hID)%2;

    //vertices of the shape
	var polypts;
	if(this.prime === 3) { //3' end: triangle
	    polypts = [this.centerX-(2*this.parity-1)*this.sqLength*0.3,this.centerY,
		       this.centerX+(2*this.parity-1)*this.sqLength*0.5,this.centerY-this.sqLength*0.5,
		       this.centerX+(2*this.parity-1)*this.sqLength*0.5,this.centerY+this.sqLength*0.5];
	}
	else if(this.prime === 5) { //5' end: square
	    //reason I didn't use Kinetic.Rect: its getX() works differently and shows the shape at wrong position
	    polypts = [this.centerX-this.sqLength*0.2-this.sqLength*this.parity*0.3,this.centerY-this.sqLength*0.35,
		       this.centerX-this.sqLength*0.2-this.sqLength*this.parity*0.3,this.centerY+this.sqLength*0.35,
		       this.centerX+this.sqLength*0.5-this.sqLength*this.parity*0.3,this.centerY+this.sqLength*0.35,
		       this.centerX+this.sqLength*0.5-this.sqLength*this.parity*0.3,this.centerY-this.sqLength*0.35];
	}
	this.shape = new Kinetic.Polygon({
	    points: polypts,
	    fill: this.parent.strandColor,
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
	this.shape.on("mousedown", function(pos) {
        console.log('endpointitem mousedown');
        console.log(this.superobj.parent.modelStrand);
        //recalculate range of movement of this endpointitem.
        this.superobj.minMaxIndices = this.superobj.parent.modelStrand.getLowHighIndices(this.superobj.prime);
        console.log(this.superobj.minMaxIndices);
	    /*
	      Since there are so many shapes on strandlayer, it is preferred to redraw the layer as few times as possible. For this reason, the layer is only refreshed when
	      the dragging is done. But this means the group should not move while dragging, and we need some other shapes to show where the group is. The red box is drawn
	      on a separate layer so render speed is fast. Both the implementation and idea are very similar to ActiveSliceItem, but this (and StrandItem) takes it a step
	      further.
	    */
        //if(!this.redBox){
            this.redBox = new Kinetic.Rect({
                x: this.superobj.centerX-this.superobj.sqLength/2,
                y: this.superobj.centerY-this.superobj.sqLength/2,
                width: this.superobj.sqLength,
                height: this.superobj.sqLength,
                fill: "transparent",
                stroke: "#FF0000",
                strokeWidth: 2,
            });
            this.redBox.superobj = this;
            this.redBox.on("mouseup", function(pos) {
                var papa = this.superobj;
                this.destroy();
                papa.superobj.tempLayer.draw();
            });
            this.superobj.tempLayer.add(this.redBox);
        //}
	    this.superobj.tempLayer.draw();
	});
	this.shape.on("dragmove", function(pos) {
        console.log('dragmove endpointitem');
        console.log(this.superobj.parent.modelStrand);
	    //we still want to keep track of the location (by counter in this case) so we know where we should draw the red square
	    var tempCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.superobj.phItem.options.parent.scaleFactor-5*this.superobj.sqLength)/this.superobj.sqLength);
	    this.superobj.adjustCounter(tempCounter);
	    if(this.superobj.counter !== this.superobj.pCounter) {
		this.superobj.pCounter = this.superobj.counter;
		//redrawing red box
		this.superobj.updateCenterX();
		this.redBox.setX(this.superobj.centerX-this.superobj.sqLength/2);
		this.superobj.tempLayer.draw();
		//throw out signals here
	    }
	});
	this.shape.on("dragend", function(pos) {
        console.log('dragend endpointitem');
        console.log(this.superobj.parent.modelStrand);
	

	    //red box has finished its duty, to be deleted
	    this.redBox.destroy();
	    this.superobj.tempLayer.draw();

        //checking if line can be drawn.
        
	    if(dir === "L") {
            if(!this.superobj.parent.modelStrand.strandSet.canBeResizedTo(this.superobj.parent.modelStrand,this.superobj.counter,this.superobj.parent.xEnd)) return;
        }
        else{
            if(!this.superobj.parent.modelStrand.strandSet.canBeResizedTo(this.superobj.parent.modelStrand,this.superobj.parent.xStart,this.superobj.counter)) return;
        }
    console.log('do i reach here');

	    this.superobj.updateCenterX();
	    this.superobj.update(); //wait for all elements to be adjusted to correct location before rendering
	    //update counter and value in StrandItem
	    if(dir === "L") {
		this.superobj.parent.xStart = this.superobj.counter;
		this.superobj.parent.updateXStartCoord();
	    }
	    else {
		this.superobj.parent.xEnd = this.superobj.counter;
		this.superobj.parent.updateXEndCoord();
	    }
        //resize the model strand.
        //
        this.superobj.parent.modelStrand.resize(this.superobj.parent.xStart,
                this.superobj.parent.xEnd);

	    //redrawing the line between two enditems aka strand
	    this.superobj.parent.connection.setX(this.superobj.parent.xStartCoord);
	    this.superobj.parent.connection.setWidth(this.superobj.parent.xEndCoord-this.superobj.parent.xStartCoord);
	    this.superobj.parent.invisConnection.setX(this.superobj.parent.xStartCoord);
	    this.superobj.parent.invisConnection.setWidth(this.superobj.parent.xEndCoord-this.superobj.parent.xStartCoord);
	    this.superobj.layer.draw();
	});
	this.layer.add(this.shape);
	this.parent.addEndItem(this,dir); //finally linking this item back to strand
    },

    updateCenterX: function() {
        this.centerX = this.parent.parent.startX
                     +(this.counter+0.5)*this.sqLength;
    },

    update: function(boo) { //only redraws when boo is true
	this.shape.setX((this.counter-this.initcounter)*this.sqLength);
	if(boo) {
	    this.layer.draw();
	}
    },

    adjustCounter: function(n) {
	this.counter = Math.min(
            Math.max(this.minMaxIndices[0],n),
            this.minMaxIndices[1]
            );
    },

    getRidOf:
    function(){
        this.shape.destroy();
        this.close();
    },
});
