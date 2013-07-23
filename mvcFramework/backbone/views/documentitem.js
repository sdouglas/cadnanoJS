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
		    self.pathView.handler.handler.setSize(pathHandler.getWidth()-posDiff, innerLayout.state.center.innerHeight);
		    if(self.sliceView.vhItemSet.vhItems.length !== 0) {
			self.pathView.pathItemSet.renderBack(); //let auto-zoom do the rest
		    }
		}
		$("#drawnPanels").off("mouseup"); //without this line, clicking on path view will trigger the mouseup handler
	    });
	}
	//note: resizing browser will still causes problems
    },

});
