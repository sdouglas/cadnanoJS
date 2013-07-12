//TODO
//1. put everything on one layer
//2. draw handler item with Kinetic.Circle()

var PathHelixSetItem = Backbone.View.extend({
    initialize: function(){
        this.handler = this.options.handler;
        this.part = this.options.part;
	this.phItemArray = new Array();
	this.phHandlerItemArray = new Array();
        console.log(this.handler);
    },
    events: {
        "mousemove" : "onMouseMove",
    },
    render: function(){
	//removing all old shapes before drawing new ones
        for(var i=this.phItemArray.length-1; i>=0; i--) {
            this.phItemArray[i].layer.remove();
	    this.phHandlerItemArray[i].layer.remove();
        }
	this.phItemArray = new Array();
	this.phHandlerItemArray = new Array();
        console.log('in render function vhitemset');
        var h = this.handler;
	var set = this;
	var pharray = this.phItemArray;
	var phharray = this.phHandlerItemArray;
        this.collection.each(function(vh){
            var phItem = new PathHelixItem({
                model: vh,
                handler: h,
		helixset: set
            });
	    var phHandlerItem = new PathHelixHandlerItem({
		model: vh,
		handler: h,
		helixset: set
	    });
            var pbcItem = new PathBaseChangeItem({
                model: vh,
                handler: h,
		helixset: set
            });
	    pharray.push(phItem);
	    phharray.push(phHandlerItem);
        });
        this.handler.render();
    },

    onMouseMove: function(e){
    },

    remove: function(){
    },

});

var PathHelixItem = Backbone.View.extend ({
    initialize: function(){
	var canvas = this.options.handler.handler;
	this.layer = new Kinetic.Layer();
	this.grLength = this.options.model.part.getStep()*21;
	this.divLength = 7;
	this.sqLength = 20; //side length of each base square
	this.startX = 5*this.sqLength;
	this.startY = 5*this.sqLength + 4*(this.options.helixset.phItemArray.length)*this.sqLength;
	for(var i=0; i<this.grLength; i++) {
	    for(var j=0; j<2; j++) {
		var rect = new Kinetic.Rect({
		    x: this.startX+i*this.sqLength+2*Math.floor(i/this.divLength),
		    y: this.startY+j*this.sqLength,
		    width: this.sqLength,
		    height: this.sqLength,
		    fill: "#FFFFFF",
		    stroke: "#DDDDDD",
		    strokeWidth: 2
		});
		this.layer.add(rect);
	    }
	}
	canvas.add(this.layer);
    },
});

var PathHelixHandlerItem = Backbone.View.extend({
    initialize: function() {
	this.sqLength = 20;
	this.part = this.options.model.getPart();
	this.handler = this.options.handler;
	var helixNum = this.options.model.hID;
	var params = {
	    fill: colours.orangefill,
	    stroke: colours.orangestroke,
	    strokewidth: colours.strokewidth,
	};
	this.polygon = this.handler.createCircle(2.5*this.sqLength,
						 6*this.sqLength + 4*(this.model.collection.length-1)*this.sqLength,
						 this.part.radius,
						 params,
						 helixNum);
    },
});

var PathBaseChangeItem = Backbone.View.extend({
    initialize: function() {
	var options = this.options;
	var canvas = this.options.handler.handler;
	var layer = new Kinetic.Layer();
	var removeBaseImg = new Image();
	removeBaseImg.onload = function() {
	    var removeBase = new Kinetic.Image({
		    x: 0,
		    y: 0,
		    image: removeBaseImg,
		    width: 25,
		    height: 25
		});
	    removeBase.on("click",function() {
		    if(options.model.part.getStep() > 0) {
			options.model.part.setStep(options.model.part.getStep()-1);
		    }
		});
	    layer.add(removeBase);
	}
	removeBaseImg.src = "ui/images/remove-bases.svg";
	var addBaseImg = new Image();
	addBaseImg.onload = function() {
	    var addBase = new Kinetic.Image({
		    x: 25,
		    y: 0,
		    image: addBaseImg,
		    width: 25,
		    height: 25,
		});
	    addBase.on("click",function() {
		    var baseIncrease = prompt("Number of bases to add to the existing "+(options.model.part.getStep())+" bases (must be a multiple of 21)","21");
		    if(baseIncrease !== null) {
			var baseInc = parseInt(baseIncrease,10);
			if(baseInc > 0 && baseInc%21 === 0) {
			    options.model.part.setStep(options.model.part.getStep()+baseInc/21);
			}
		    }
		});
	    layer.add(addBase);
	    canvas.add(layer);
	};
	addBaseImg.src = "ui/images/add-bases.svg";
    },
});