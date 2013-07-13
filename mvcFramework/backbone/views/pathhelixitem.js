var PathHelixSetItem = Backbone.View.extend({
    initialize: function(){
	//PathHelixSetItem should contains variables that multiple sub-classes need
        this.handler = this.options.handler;
        this.part = this.options.part;
	//path view layers
	this.backlayer = new Kinetic.Layer(); //background layer: PathHelixItem, PathHelixHandlerItem, PathBaseChangeItem
	this.handler.handler.add(this.backlayer);
	this.activeslicelayer = new Kinetic.Layer(); //slidebar layer: ActiveSliceItem
	this.handler.handler.add(this.activeslicelayer);
	//scale factor
	this.ratioX = 1;
	this.ratioY = 1;
	this.pratioX = 1;
	this.pratioY = 1;
	//objects
	this.phItemArray = new Array(); //stores PathHelixItem
	this.activesliceItem = new ActiveSliceItem({
	    handler: this.handler,
	    parent: this,
	    graphics: {
		sqLength: 20,
		divLength: 7,
		grLength: 21*this.part.getStep()
            }
	});
    },
    events: {
        "mousemove" : "onMouseMove",
    },
    renderBack: function(){
	//removing all old shapes before drawing new ones
	this.backlayer.removeChildren();
	this.phItemArray = new Array();
        console.log('in render function vhitemset');
	//variables that the items created in foreach loop can access
        var h = this.handler;
	var dims = {
	    sqLength: 20,
	    divLength: 7,
	    grLength: 21*this.part.getStep()
	};
	var helixset = this;
	var pharray = this.phItemArray;
	//we only need 1 base changer button
	var pbcItem = new PathBaseChangeItem({
	    handler: h,
	    parent: helixset
	});
	//for each VirtualHelixItem, we create a path helix and a path helix handler
        this.collection.each(function(vh){
            var phItem = new PathHelixItem({
                model: vh,
                handler: h,
		parent: helixset,
		graphics: dims 
            });
	    var phHandlerItem = new PathHelixHandlerItem({
		model: vh,
		handler: h,
		parent: helixset,
		graphics: dims
	    });
	    pharray.push(phItem);
        });
	
	//calculating the new scale factor
	this.ratioX = Math.min(1,innerLayout.state.center.innerWidth/(8*dims.sqLength+dims.sqLength*dims.grLength+2*dims.grLength/dims.divLength));
	this.ratioY = Math.min(1,innerLayout.state.center.innerHeight/(7*dims.sqLength+4*pharray.length*dims.sqLength));
	if(this.ratioX === this.pratioX && this.ratioY === this.pratioY) { //no scale factor changes, just redraw backlayer
	    this.backlayer.draw();
	}
	else { //scale factor changed, have to rescale and redraw EVERY layer and update pratio
	    this.backlayer.setScale(Math.min(this.ratioX,this.ratioY)); //ensures everything can be seen while maintaining aspect ratio
	    this.backlayer.draw();
	    this.activeslicelayer.setScale(Math.min(this.ratioX,this.ratioY));
	    this.activeslicelayer.draw();
	    //reset previous ratio
	    this.pratioX = this.ratioX;
	    this.pratioY = this.ratioY;
	}
    },

    renderActiveslice: function() {
	    this.activeslicelayer.draw();
    },

    onMouseMove: function(e){
    },

    remove: function(){
    },

});

var PathHelixItem = Backbone.View.extend ({
    initialize: function(){
	this.layer = this.options.parent.backlayer;
	this.grLength = this.options.graphics.grLength;
	this.divLength = this.options.graphics.divLength;
	this.sqLength = this.options.graphics.sqLength;

	this.startX = 5*this.sqLength;
	this.startY = 5*this.sqLength + 4*(this.options.parent.phItemArray.length)*this.sqLength;
	for(var i=0; i<this.grLength; i++) {
	    for(var j=0; j<2; j++) {
		var rect = new Kinetic.Rect({
		    x: this.startX+i*this.sqLength+2*Math.floor(i/this.divLength),
		    y: this.startY+j*this.sqLength,
		    width: this.sqLength,
		    height: this.sqLength,
		    fill: "#FFFFFF",
		    stroke: "#DDDDDD",
		    strokeWidth: 2,
		});
		this.layer.add(rect);
	    }
	}
    },
});

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
	    align: "CENTER"
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

var PathBaseChangeItem = Backbone.View.extend({
    initialize: function() {
	var part = this.options.parent.part;
	var canvas = this.options.handler.handler;
	var layer = this.options.parent.backlayer;

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
		    var baseIncrease = prompt("Number of bases to add to the existing "+(21*part.getStep())+" bases (must be a multiple of 21)","21");
		    if(baseIncrease !== null) {
			var baseInc = parseInt(baseIncrease,10);
			if(baseInc > 0 && baseInc%21 === 0) {
			    part.setStep(part.getStep()+baseInc/21);
			}
		    }
		});
	    layer.add(addBase);
	    canvas.add(layer);
	};
	addBaseImg.src = "ui/images/add-bases.svg";
    },
});