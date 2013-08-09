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
	//$("#drawnPanels").bind('mousedown',this.autoresize); //we will check where we are clicking in autoresize //useless for now

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
        var jSliceView = $('#sliceView');
        var svWidth = jSliceView.css('width');
        if('0px' === svWidth || !svWidth) 
            svWidth = Constants.SliceViewWidth;

        var svHeight = jSliceView.css('height');
        if('0px' === svHeight || !svHeight) 
            svHeight = Constants.SliceViewHeight;

        //The parseInt converts the string to a number.
        //Kinetic.js doesn't work with 100px, but works with
        //the literal 100.
        var svParams = {
            container:   'sliceView', 
            width:  parseInt(svWidth,10), 
            height: parseInt(svHeight,10),
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
	var self = this;
	var sliceCanvas = $(this.sliceView.handler.textLayer.getContext().canvas); //need to use top layer
	sliceCanvas.attr("tabindex","0"); //without this line canvas cannot get focus
	sliceCanvas.click(function(ev) {sliceCanvas.focus();});
	sliceCanvas.keyup(function(ev) {self.sliceZoom(ev);});

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
	var pathCanvas = $(this.pathView.pathItemSet.activeslicelayer.getContext().canvas); //need to use top layer
	pathCanvas.attr("tabindex","0"); //without this line canvas cannot get focus
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
	//console.log(e.keyCode);
    },

    keyup: function(e){
	if(e.keyCode === 67) { //C
	    tbArrayChange(0); //enable/disable scaffold selection
	}
	else if(e.keyCode === 84) { //T
	    tbArrayChange(1); //enable/disable staple selection
	}
	else if(e.keyCode === 72) { //H
	    tbArrayChange(2); //enable/disable handler selection
	}
	else if(e.keyCode === 69) { //E
	    tbArrayChange(3); //enable/disable endpoint selection
	}
	else if(e.keyCode === 88) { //X
	    tbArrayChange(4); //enable/disable xover selection
	}
	else if(e.keyCode === 68) { //D
	    tbArrayChange(5); //enable/disable strand selection
	}
	else if(e.keyCode === 86) { //V
	    this.currDoc.pathTool = "select";
	    document.getElementById("pb0").checked = true;
	}
	else if(e.keyCode === 78) { //N
	    this.currDoc.pathTool = "pencil";
	    document.getElementById("pb1").checked = true;
	}
	else if(e.keyCode === 66) { //B
	    this.currDoc.pathTool = "break";
	    document.getElementById("pb2").checked = true;
	}
	else if(e.keyCode === 73) { //I
	    this.currDoc.pathTool = "insert";
	    document.getElementById("pb3").checked = true;
	}
	else if(e.keyCode === 83) { //S
	    this.currDoc.pathTool = "skip";
	    document.getElementById("pb4").checked = true;
	}
	else if(e.keyCode === 80) { //P
	    this.currDoc.pathTool = "paint";
	    document.getElementById("pb5").checked = true;
	}
	else if(e.keyCode === 65) { //A
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
	var zoomArray = [0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
	if(e.keyCode === 107) { //plus sign
	    var zoomLvl;
	    for(var i=0; i<zoomArray.length; i++) {
		if(zoomArray[i] === this.sliceView.zoomFactor) {zoomLvl = i; break;}
	    }
	    if(zoomLvl !== 12) {
		zoomLvl += 1;
		var oldZf = this.sliceView.zoomFactor;
		this.sliceView.zoomFactor = zoomArray[zoomLvl];
		this.sliceView.handler.handler.setWidth(this.sliceView.handler.handler.getWidth()*this.sliceView.zoomFactor/oldZf);
		this.sliceView.handler.handler.setHeight(this.sliceView.handler.handler.getHeight()*this.sliceView.zoomFactor/oldZf);
		this.sliceView.handler.textLayer.setScale(this.sliceView.zoomFactor);
		this.sliceView.handler.shapeLayer.setScale(this.sliceView.zoomFactor);
		this.sliceView.handler.helixLayer.setScale(this.sliceView.zoomFactor);
		this.sliceView.handler.hoverLayer.setScale(this.sliceView.zoomFactor);
		this.sliceView.handler.render();
	    }
	}
	else if(e.keyCode === 109) { //minus sign
	    var zoomLvl;
	    for(var i=0; i<zoomArray.length; i++) {
		if(zoomArray[i] === this.sliceView.zoomFactor) {zoomLvl = i; break;}
	    }
	    if(zoomLvl !== 0) {
		zoomLvl -= 1;
		var oldZf = this.sliceView.zoomFactor;
		this.sliceView.zoomFactor = zoomArray[zoomLvl];
		this.sliceView.handler.handler.setWidth(this.sliceView.handler.handler.getWidth()*this.sliceView.zoomFactor/oldZf);
		this.sliceView.handler.handler.setHeight(this.sliceView.handler.handler.getHeight()*this.sliceView.zoomFactor/oldZf);
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
		this.pathView.pathItemSet.zoom();
		this.pathView.pathItemSet.render();
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
		this.pathView.pathItemSet.render();
	    }
	}
    },

    autoresize: function(pos) {
	if(pos.pageX-50-innerLayout.state.west.innerWidth <= 0 && pos.pageX-50-innerLayout.state.west.innerWidth >= -4) { //checking if we're clicking divider
	    var self = this;
	    var originalPos = pos.pageX;
	    $("#drawnPanels").on("mouseup", function(pos) { //dragging is essentially mousedown -> mousemove -> mouseup
		var posDiff = pos.pageX-originalPos;
		if(self.sliceView instanceof SlicePartItem) { //only change handler properties if it exists
		    var sliceHandler = self.sliceView.handler.handler;
		    self.sliceView.handler.handler.setSize(sliceHandler.getWidth()+posDiff, innerLayout.state.west.innerHeight);
		    var pathHandler = self.pathView.handler.handler;
		    if(self.sliceView.vhItemSet.vhItems.length !== 0) {
			self.pathView.pathItemSet.render(); //let auto-zoom do the rest
		    }
		}
		$("#drawnPanels").off("mouseup"); //without this line, clicking on path view will trigger the mouseup handler
	    });
	}
	//note: resizing browser will still causes problems
    },

});
