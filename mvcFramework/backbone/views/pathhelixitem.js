var PathHelixSetItem = Backbone.View.extend({
    initialize: 
    function(){
        //PathHelixSetItem should contains variables that multiple sub-classes need
        this.handler = this.options.handler;
        this.part = this.options.part;

        //path view layers
        this.backlayer = new Kinetic.Layer(); //background layer: PathHelixItem, PathHelixHandlerItem, PathBaseChangeItem
        this.handler.handler.add(this.backlayer);
        this.activeslicelayer = new Kinetic.Layer(); //slidebar layer: ActiveSliceItem
        
        this.handler.handler.add(this.activeslicelayer);
        this.buttonlayer = new Kinetic.Layer(); //button layer: PathBaseChangeItem
        this.handler.handler.add(this.buttonlayer);
        this.strandlayer = new Kinetic.Layer(); //strand layer: StrandItem, EndPointItem, XoverItem
        this.handler.handler.add(this.strandlayer);
        //some things should be on the top
        this.activeslicelayer.moveToTop();

        //scale factor
        this.ratioX = 1;
        this.ratioY = 1;
        this.pratioX = 1;
        this.pratioY = 1;
        this.scaleFactor = 1;

        //objects
        this.phItemArray = new Array(); //stores PathHelixItem
        this.phHandlerItemArray = new Array(); //stores PathHelixHandlerItem
        this.graphicsSettings = {
            sqLength: 20,
            divLength: 7,
            blkLength: 3
        };

        //slidebar
        this.activesliceItem = new ActiveSliceItem({
            handler: this.handler,
            parent: this,
            graphics: this.graphicsSettings
        });

    },

    events: {
        "mousemove" : "onMouseMove",
    },

    renderBack: function(){
	//removing all old shapes before drawing new ones
    this.clear();
    console.log('in render function vhitemset');

        //button to press after resize
        this.resizerItem = new ResizerItem({
            handler: this.handler,
            parent: this
        });

        //buttons that change base length
        this.pbcItem = new PathBaseChangeItem({
            handler: this.handler,
            parent: this,
            graphics: this.graphicsSettings
        });

    //variables that the items created in foreach loop can access
    var h = this.handler;
	var dims = this.graphicsSettings;
	dims.grLength = dims.blkLength*dims.divLength*this.part.getStep(); //grLength is only used here because background is immutable

	var helixset = this;
	var pharray = this.phItemArray;
    var phharray = this.phHandlerItemArray;
	
    //Remove all existing pathhelixitems.
    //for each VirtualHelixItem, we create a path helix and a path helix handler
    this.collection.each(function(vh){
        var phItem = new PathHelixItem({
            model: vh,
            handler: h,
            parent: helixset,
            graphics: dims,
        });
        var phHandlerItem = new PathHelixHandlerItem({
            model: vh,
            handler: h,
            parent: helixset,
            graphics: dims
        });
        pharray.push(phItem);
        phharray.push(phHandlerItem);
    });

	//calculating the new scale factor
	this.ratioX = Math.min(1,innerLayout.state.center.innerWidth/(8*dims.sqLength+dims.sqLength*dims.grLength));
	this.ratioY = Math.min(1,innerLayout.state.center.innerHeight/(7*dims.sqLength+4*pharray.length*dims.sqLength));
	//no scale factor changes, just redraw backlayer
	if(this.ratioX === this.pratioX && this.ratioY === this.pratioY) {
	    this.backlayer.draw();
	}
	//scale factor changed, have to rescale and redraw EVERY layer and update pratio
	else {
	    this.scaleFactor = Math.min(this.ratioX,this.ratioY);
	    this.backlayer.setScale(this.scaleFactor); //ensures everything can be seen while maintaining aspect ratio
	    this.backlayer.draw();
	    this.activeslicelayer.setScale(this.scaleFactor);
	    this.activeslicelayer.draw();
	    this.buttonlayer.setScale(this.scaleFactor);
	    this.buttonlayer.draw();
	    this.strandlayer.setScale(this.scaleFactor);
	    this.strandlayer.draw();
	    //reset previous ratio
	    this.pratioX = this.ratioX;
	    this.pratioY = this.ratioY;
	}

    console.log(pharray);
	if(pharray.length === 2) {
	    /*
	    var strandItem0 = new StrandItem(pharray[0],0,0,15);
        var end0L = new XoverNode(strandItem0, "L", 5);
	    var end0R = new XoverNode(strandItem0, "R", 3);
	    var strandItem1 = new StrandItem(pharray[1],1,0,15);
	    var end1L = new XoverNode(strandItem1, "L", 3);
	    var end1R = new XoverNode(strandItem1, "R", 5);
	    var xoverL = new XoverItem(end0L,end1L);
	    var xoverR = new XoverItem(end0R,end1R);
        */
	}
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
            this.phHandlerItemArray[i].close();
        }
        this.phItemArray.length = 0;
        this.phHandlerItemArray.length = 0;
        if(this.resizerItem) this.resizerItem.close();
        if(this.pbcItem) this.pbcItem.close();
        this.buttonlayer.removeChildren();
    },

});

//the long rectangular base grid
var PathHelixItem = Backbone.View.extend ({
    initialize: function(){
    console.log('creating pathhelixitem');
	this.layer = this.options.parent.backlayer;
	this.group = new Kinetic.Group();
	this.grLength = this.options.graphics.grLength;
	this.divLength = this.options.graphics.divLength;
	this.sqLength = this.options.graphics.sqLength;
    this.ylevel = this.options.ylevel;

	this.startX = 5*this.sqLength;
	this.startY = 5*this.sqLength+4*(this.options.parent.phItemArray.length)*this.sqLength;
    
    //Keeping track of all the strandItems
    this.stItemArray = new Array();

	for(var i=0; i<this.grLength; i++) {
	    for(var j=0; j<2; j++) {
		var rect = new Kinetic.Rect({
		    x: this.startX+i*this.sqLength,
		    y: this.startY+j*this.sqLength,
		    width: this.sqLength,
		    height: this.sqLength,
		    fill: "#FFFFFF",
		    stroke: "#DDDDDD",
		    strokeWidth: 2,
		});
		this.group.add(rect);
	    }
	    if(i%7 == 0) { //divider lines are blacker
		var divLineXStart = this.startX+i*this.sqLength;
		var divLine = new Kinetic.Line({
		    points: [divLineXStart,this.startY,divLineXStart,this.startY+2*this.sqLength],
		    stroke: "#666666",
		    strokeWidth: 2
		});
		this.group.add(divLine);
	    }
	}
	this.layer.add(this.group);
    this.connectSignalsSlots();
    },

    connectSignalsSlots:
    function(){
        this.listenTo(this.model.scafStrandSet,
                cadnanoEvents.strandSetStrandAddedSignal,
                this.strandAddedSlot
                );
        this.listenTo(this.model.scafStrandSet,
                cadnanoEvents.strandSetStrandRemovedSignal,
                this.strandRemovedSlot
                );
    },

    strandAddedSlot:
    function(strand, id){
        console.log('HERE in strandAddedSlot, by helix id:'+this.model.hID);
        //Create a strand item object.
        var stItem = new StrandItem(strand,
             this, 
             strand.baseIdxLow, 
             strand.baseIdxHigh
        );
        this.stItemArray.push(stItem);
        console.log(this.stItemArray.length);
    },

    strandRemovedSlot:
    function(strand){
        console.log('in strandRemovedSlot');
        var len = this.stItemArray.length;
        console.log(len);
        for(var i=0; i<len; i++){
           // if(this.stItemArray[i].baseIdxLow === strand.low() &&
           //    this.stItemArray[i].baseIdxHigh === strand.high()){
           console.log(this.stItemArray[i].modelStrand);
           console.log(strand);
            if(this.stItemArray[i].modelStrand === strand){
                this.stItemArray[i].getRidOf();
                this.stItemArray.splice(i,1);
                console.log('true');
                return true;
            }
        }
        console.log('false');
        return false;
    },

});

//the circle next to PathHelixItem
var PathHelixHandlerItem = Backbone.View.extend({
    initialize: function() {
	this.sqLength = this.options.graphics.sqLength;
	this.part = this.options.model.getPart();

	this.layer = this.options.parent.backlayer;
	this.group = new Kinetic.Group();
	var helixNum = this.options.model.hID;
	var circ = new Kinetic.Circle({
	    x: 2.5*this.sqLength,
	    y: 6*this.sqLength + 4*(this.options.parent.phItemArray.length)*this.sqLength,
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
	    fill: "#000000",
	});
	helixNumText.setOffset({
	    x: helixNumText.getWidth()/2
	});
        //end: number on the circle
	this.group.add(circ);
        this.group.add(helixNumText);
	this.layer.add(this.group);
    },
});

//the green button that says "auto-resize". should be used after the panel resizer is moved
var ResizerItem = Backbone.View.extend({
    initialize: function() {
	var self = this;
	var canvas = this.options.handler.handler;
	var layer = this.options.parent.buttonlayer;
	var group = new Kinetic.Group();
	var rect = new Kinetic.Rect({
	    x: 70,
	    y: 0,
	    width: 75,
	    height: 30,
	    fill: "#88FF88",
	    stroke: "#000000",
	    strokeWidth: 1
	});
	var text = new Kinetic.Text({
	    x: 70,
	    y: 7,
	    text: "Auto-resize",
	    fontSize: 16,
	    fontFamily: "Calibri",
	    fill: "#000000",
	});
	group.add(rect);
	group.add(text);
	group.on("click", function() {
	    if(innerLayout.state.center.innerWidth !== canvas.getWidth() || innerLayout.state.center.innerHeight !== canvas.getHeight()) {
		canvas.setSize(innerLayout.state.center.innerWidth, innerLayout.state.center.innerHeight);
		self.options.parent.renderBack();
	    }
	});
	layer.add(group);
    },
});

//the two arrows on the top left corner that can change the length of PathHelixItem
var PathBaseChangeItem = Backbone.View.extend({
    initialize: function() {
	var part = this.options.parent.part;
	var canvas = this.options.handler.handler;
	var layer = this.options.parent.buttonlayer;
	var baseperblk = this.options.graphics.blkLength*this.options.graphics.divLength;

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
			part.setStep(part.getStep()-1);
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
			var baseInc = parseInt(baseIncrease,10);
			if(baseInc > 0 && baseInc%baseperblk === 0) {
			    part.setStep(part.getStep()+baseInc/baseperblk);
			}
		    }
		});
	    layer.add(addBase);
	    canvas.add(layer);
	};
	addBaseImg.src = "ui/images/add-bases.svg";
    },
});
