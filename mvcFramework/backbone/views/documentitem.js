/*******DOCUMENTITEM*********/
var DocumentItem = Backbone.View.extend({

    events: {
        "keydown" : "undohere",
	"mousedown" : "autoresize",
    },

    initialize: function(){
        //These keys are to bind a keypress to a function.
        _.bindAll(this);
        $(document).bind('keypress',this.undohere);
	$(document).bind('keydown',this.keydown);
        $(document).bind('keyup',this.keyup);
	$("#drawnPanels").bind('mousedown',this.autoresize); //we will check where we are clicking in autoresize

        //Rest of init.
        this.currDoc = this.options.currDoc;
        this.listenTo(  this.currDoc,
                        cadnanoEvents.documentPartAddedSignal,
                        this.documentPartAddedSlot
                );
        this.listenTo( this.currDoc,
                        cadnanoEvents.documentClearSelectionsSignal,
                        this.documentClearSelectionsSlot
                );
        console.log("called init");
    },

    documentPartAddedSlot: function(){
        console.log("called documentPartAddedSlot");

        //Slice View Parameters.
        //The parseInt converts the string to a number.
        //Kinetic.js doesn't work with 100px, but works with
        //the literal 100.
        var jSliceView = $('#sliceView');
	var svMinWidth = this.currDoc.part().getOrigin()+1.732*this.currDoc.part().getCols()*this.currDoc.part().getRadius(); //for square change 1.732 to 2
        var svWidth = jSliceView.css('width');
        if('0px' === svWidth || !svWidth) 
            svWidth = Constants.SliceViewWidth;
	svWidth = Math.max(parseInt(svWidth,10), svMinWidth);
	var svMinHeight = this.currDoc.part().getOrigin()+3*this.currDoc.part().getRows()*this.currDoc.part().getRadius(); //for square change 3 to 2
        var svHeight = jSliceView.css('height');
        if('0px' === svHeight || !svHeight) 
            svHeight = Constants.SliceViewHeight;
	svHeight = Math.max(parseInt(svHeight,10), svMinHeight);

        var svParams = {
            container:   'sliceView', 
            width:  svWidth, 
            height: svHeight,
        };
        
        //Note: Its important to pass in the "el" element in the constructor
        //since the jquery selectors only function after the DOM is loaded.
        //However, we are using our functions before the DOM is loaded.
        this.sliceView = new SlicePartItem({
            el:     jSliceView,
            part:   this.currDoc.part(), 
            params: svParams, 
            who:    Constants.RendererKinetic,
        });
	//following 5 lines is for receiving key functions in kinetic canvas, which does not support key events
	var self = this;
	var sliceCanvas = $(this.sliceView.handler.textLayer.getContext().canvas); //need to use the topmost layer
	sliceCanvas.attr("tabindex","0"); //ability to give focus to a canvas
	sliceCanvas.click(function(ev) {sliceCanvas.focus();}); //setting a mechanism (click) to allow canvas to receive focus
	sliceCanvas.keyup(function(ev) {self.sliceZoom(ev);}); //finally canvas will respond to key events!

        //Path View Parameters.
        var jPathView = $('#pathView');
        var pvWidth = jPathView.css('width');
        if('0px' === pvWidth) 
            pvWidth = Constants.SliceViewWidth;
        
        var pvHeight = jPathView.css('height');
        if('0px' === pvHeight) 
            pvHeight = Constants.SliceViewHeight;
        
        var pvParams = {
            container:   'pathView', 
            width:  parseInt(pvWidth,10), 
            height: parseInt(pvHeight,10),
        };
        
        this.pathView = new PathPartItem({
            el:     jPathView,
            part:   this.currDoc.part(), 
            params: pvParams, 
            who:    Constants.RendererKinetic,
        });
	//receiving key functions for path view canvas
	var pathCanvas = $(this.pathView.pathItemSet.activeslicelayer.getContext().canvas);
	pathCanvas.attr("tabindex","0");
	pathCanvas.click(function(ev) {pathCanvas.focus();});
	pathCanvas.keyup(function(ev) {self.pathZoom(ev);});
    },

    documentClearSelectionsSlot: function(){
        //TODO:
        //remove an existing view completely. Right now,
        //its just a hack - multiple views get called each
        //time an undo redo takes place.
        //this.sliceView.remove();
        this.sliceView.close();
        delete this.sliceView;
    },

    reset: function(){
        //remove existing views - and recreate everything else.
    },

    keydown: function(e) {
	this.currDoc.setKey(e.keyCode);
    },

    keyup: function(e){
	if(e.keyCode === 67) { //C- enable/disable scaffold selection
	    tbArrayChange(0); //tbArrayChange defined in ui/lib/tbSelectable.js
	}
	else if(e.keyCode === 84) { //T- enable/disable staple selection
	    tbArrayChange(1);
	}
	else if(e.keyCode === 72) { //H- enable/disable handler selection
	    tbArrayChange(2);
	}
	else if(e.keyCode === 69) { //E- enable/disable endpoint selection
	    tbArrayChange(3);
	}
	else if(e.keyCode === 88) { //X- enable/disable xover selection
	    tbArrayChange(4);
	}
	else if(e.keyCode === 68) { //D- enable/disable strand selection
	    tbArrayChange(5);
	}
	else if(e.keyCode === 86) { //V- change path tool to select
	    this.currDoc.pathTool = "select";
	    document.getElementById("pb0").checked = true; //id to radio buttons given in cadnano3.html
	}
	else if(e.keyCode === 78) { //N- change path tool to pencil
	    this.currDoc.pathTool = "pencil";
	    document.getElementById("pb1").checked = true;
	}
	else if(e.keyCode === 66) { //B- change path tool to break
	    this.currDoc.pathTool = "break";
	    document.getElementById("pb2").checked = true;
	}
	else if(e.keyCode === 73) { //I- change path tool to insert
	    this.currDoc.pathTool = "insert";
	    document.getElementById("pb3").checked = true;
	}
	else if(e.keyCode === 83) { //S- change path tool to skip
	    this.currDoc.pathTool = "skip";
	    document.getElementById("pb4").checked = true;
	}
	else if(e.keyCode === 80) { //P- change path tool to paint
	    this.currDoc.pathTool = "paint";
	    document.getElementById("pb5").checked = true;
	}
	else if(e.keyCode === 65) { //A- change path tool to seq
	    this.currDoc.pathTool = "seq";
	    document.getElementById("pb6").checked = true;
	}
       this.currDoc.setKey(null);
    },

    undohere: function(e){
        //undo - press u
        if(e.charCode === 117){
            console.log('Undo last step');
            this.currDoc.undo();
        }
        //redo - press r
        else if (e.charCode === 114){
            console.log('Redo last step');
            console.log(this.currDoc);
            this.currDoc.redo();
        }
        else if (e.charCode === 113){
            this.currDoc.stackStatus();
        }
        this.currDoc.setKey(e.charCode);
    },

    sliceZoom: function(e) {
	var zoomArray = [0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5]; //discrete zooming levels to reduce lag
	if(e.keyCode === 107) { //plus sign- zoom in
	    var zoomLvl;
	    for(var i=0; i<zoomArray.length; i++) {
		//view only stores the zoom factor so we need to get the corresponding level first
		if(zoomArray[i] === this.sliceView.zoomFactor) {zoomLvl = i; break;}
	    }
	    if(zoomLvl !== 12) {
		zoomLvl += 1;
		this.sliceView.zoomFactor = zoomArray[zoomLvl];
		//change the stage's properties
		var svMinWidth = this.currDoc.part().getOrigin()+1.732*this.currDoc.part().getCols()*this.currDoc.part().getRadius();
		var svMinHeight = this.currDoc.part().getOrigin()+3*this.currDoc.part().getRows()*this.currDoc.part().getRadius();
		this.sliceView.handler.handler.setWidth(Math.max(svMinWidth*this.sliceView.zoomFactor,innerLayout.state.west.innerWidth));
		this.sliceView.handler.handler.setHeight(Math.max(svMinHeight*this.sliceView.zoomFactor,innerLayout.state.west.innerHeight));
		//change the layers' scaling factor
		this.sliceView.handler.textLayer.setScale(this.sliceView.zoomFactor);
		this.sliceView.handler.shapeLayer.setScale(this.sliceView.zoomFactor);
		this.sliceView.handler.helixLayer.setScale(this.sliceView.zoomFactor);
		this.sliceView.handler.hoverLayer.setScale(this.sliceView.zoomFactor);
		//redraw every layer; will take up some time
		this.sliceView.handler.render();
	    }
	}
	else if(e.keyCode === 109) { //minus sign- zoom out
	    var zoomLvl;
	    for(var i=0; i<zoomArray.length; i++) {
		if(zoomArray[i] === this.sliceView.zoomFactor) {zoomLvl = i; break;}
	    }
	    if(zoomLvl !== 0) {
		zoomLvl -= 1;
		this.sliceView.zoomFactor = zoomArray[zoomLvl];
		var svMinWidth = this.currDoc.part().getOrigin()+1.732*this.currDoc.part().getCols()*this.currDoc.part().getRadius();
		var svMinHeight = this.currDoc.part().getOrigin()+3*this.currDoc.part().getRows()*this.currDoc.part().getRadius();
		this.sliceView.handler.handler.setWidth(Math.max(svMinWidth*this.sliceView.zoomFactor,innerLayout.state.west.innerWidth));
		this.sliceView.handler.handler.setHeight(Math.max(svMinHeight*this.sliceView.zoomFactor,innerLayout.state.west.innerHeight));
		this.sliceView.handler.textLayer.setScale(this.sliceView.zoomFactor);
		this.sliceView.handler.shapeLayer.setScale(this.sliceView.zoomFactor);
		this.sliceView.handler.helixLayer.setScale(this.sliceView.zoomFactor);
		this.sliceView.handler.hoverLayer.setScale(this.sliceView.zoomFactor);
		this.sliceView.handler.render();
	    }
	}
    },

    pathZoom: function(e) {
	var zoomArray = [0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
	if(e.keyCode === 107) { //plus sign
	    var zoomLvl;
	    for(var i=0; i<zoomArray.length; i++) {
		if(zoomArray[i] === this.pathView.pathItemSet.userScale) {zoomLvl = i; break;}
	    }
	    if(zoomLvl !== 12) {
		zoomLvl += 1;
		this.pathView.pathItemSet.userScale = zoomArray[zoomLvl];
		//zoom function changes stage properties and layer scaling factor
		this.pathView.pathItemSet.zoom();
		this.pathView.pathItemSet.redrawLayers();
	    }
	}
	else if(e.keyCode === 109) { //minus sign
	    var zoomLvl;
	    for(var i=0; i<zoomArray.length; i++) {
		if(zoomArray[i] === this.pathView.pathItemSet.userScale) {zoomLvl = i; break;}
	    }
	    if(zoomLvl !== 0) {
		zoomLvl -= 1;
		this.pathView.pathItemSet.userScale = zoomArray[zoomLvl];
		this.pathView.pathItemSet.zoom();
		this.pathView.pathItemSet.redrawLayers();
	    }
	}
    },

    autoresize: function(pos) {
	if(pos.pageX-50-innerLayout.state.west.innerWidth <= 0 && pos.pageX-50-innerLayout.state.west.innerWidth >= -4) { //checking if we're clicking divider
	    var self = this;
	    var originalPos = pos.pageX;
	    $("#drawnPanels").on("mouseup", function(pos) { //dragging is essentially mousedown -> mousemove -> mouseup
		if(self.sliceView instanceof SlicePartItem) { //only change handler properties if it exists
		    var posDiff = pos.pageX-originalPos;
		    var sliceHandler = self.sliceView.handler.handler;
		    self.sliceView.handler.handler.setWidth(sliceHandler.getWidth()+posDiff*self.sliceView.zoomFactor);
		    var pathHandler = self.pathView.handler.handler;
		    //innerWidth is not updated yet in this function
		    self.pathView.pathItemSet.autoScale = Math.min(1,(innerLayout.state.center.innerWidth-posDiff)/
								   (self.pathView.pathItemSet.graphicsSettings.sqLength*
								    (8+2*self.pathView.pathItemSet.graphicsSettings.divLength*
								     self.pathView.pathItemSet.graphicsSettings.blkLength)));
		    self.pathView.pathItemSet.zoom();
		    pathHandler.setWidth(Math.max(pathHandler.getWidth(), innerLayout.state.center.innerWidth-posDiff));
		    self.pathView.pathItemSet.redrawLayers();
		}
		$("#drawnPanels").off("mouseup"); //without this line, clicking on path view will trigger the mouseup handler
	    });
	}
	//note: resizing browser will still causes problems
    },

});

//resizing browser
var rtime = new Date(1, 1, 2000, 12,00,00);
var timeout = false;
var delta = 200;
$(window).resize(function() {
    rtime = new Date();
    if (timeout === false) {
	timeout = true;
	setTimeout(resizeend, delta);
    }
});

function resizeend() {
    if(new Date()-rtime < delta) {
	setTimeout(resizeend, delta);
    }
    else {
        timeout = false;
	//innerWidth and innerHeight is already updated by this point
    }
}