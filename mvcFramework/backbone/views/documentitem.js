/*******DOCUMENTITEM*********/
var DocumentItem = Backbone.View.extend({

    events: {
    "click" : "Zooming",
    "click .slice-button" : "Moving",
    "click #edit" : "Editing"
    },

    Zooming: function(){
                 console.log("clicked on zoom");
             },
    Moving: function(){
                 console.log("clicked on move");
             },
    Editing: function(){
                 console.log("clicked on edit");
             },

    initialize: function(){
        this.currDoc = this.options.currDoc;
        this.listenTo(  this.currDoc,
                        cadnanoEvents.documentPartAddedSignal,
                        this.documentPartAddedSlot
                        );
        console.log("called init");
    },

    documentPartAddedSlot: function(){
        console.log("called documentPartAddedSlot");

        //Slice View Parameters.
        var jSliceView = $('#sliceView');
        var svWidth = jSliceView.css('width');
        if('0px' === svWidth) 
            svWidth = Constants.SliceViewWidth;

        var svHeight = jSliceView.css('height');
        if('0px' === svHeight) 
            svHeight = Constants.SliceViewHeight;

        var svParams = {
            container:   'sliceView', 
            width:  svWidth, 
            height: svHeight,
        };
        
        //Note: Its important to pass in the "el" element in the constructor
        //since the jquery selectors only function after the DOM is loaded.
        //However, we are using our functions before the DOM is loaded.
        /*
        var sliceView = new SlicePartItem({
            el:     jSliceView,
            part:   this.currDoc.part(), 
            params: svParams, 
            who:    Constants.RendererKinetic,
        });
        */
        var handler = new viewHandlerKinetic();
        handler.setParams(svParams);
        handler.createCircle(150,150,40);
        handler.render();
        console.log(document.getElementById('sliceView'));
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
            width:  pvWidth, 
            height: pvHeight,
        };
        
        /*
        var pathView = new PathPartItem({
            el:     jPathView,
            part:   this.currDoc.part(), 
            params: pvParams, 
            who:    Constants.RendererKinetic,
        });
        */
    },

    reset: function(){
        //remove existing views - and recreate everything else.
    },

});
