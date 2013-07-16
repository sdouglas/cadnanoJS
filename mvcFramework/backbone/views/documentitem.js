/*******DOCUMENTITEM*********/
var DocumentItem = Backbone.View.extend({

    events: {
        "keydown" : "undohere",
    },

    initialize: function(){
        //These keys are to bind a keypress to a function.
        _.bindAll(this);
        $(document).bind('keypress',this.undohere);

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
        console.log(svParams);
        
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
    },

    reset: function(){
        //remove existing views - and recreate everything else.
    },

    undohere: function(e){
        //undo - press u
        if(e.charCode === 117){
            console.log('Undo last step');
            console.log(this.currDoc);
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
        console.log(e);
    },

});
