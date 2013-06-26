/*******DOCUMENTITEM*********/
var DocumentItem = Backbone.View.extend({
    el: $(".complete-doc"),

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
        this.listenTo(this.currDoc,'change',this.documentPartAddedSlot);
        console.log("called init");
    },

    documentPartAddedSlot: function(){
        console.log("called documentPartAddedSlot");

        //Slice View Parameters.
        var sliceViewWidth = $('#slice-view').css('width');
        if('0px' === sliceViewWidth) 
            sliceViewWidth = Constants.SliceViewWidth;

        var sliceViewHeight = $('#slice-view').css('height');
        if('0px' === sliceViewHeight) 
            sliceViewHeight = Constants.SliceViewHeight;

        var sliceViewParams = {
            type:   Two.Types.svg, 
            width:  sliceViewWidth, 
            height: sliceViewHeight,
        };
        
        //Note: Its important to pass in the "el" element in the constructor
        //since the jquery selectors only function after the DOM is loaded.
        //However, we are using our functions before the DOM is loaded.
        
        var sliceView = new SlicePartItem({
            el:     $('#slice-view'),
            part:   this.currDoc.part(), 
            params: sliceViewParams, 
            who:    Constants.RendererTwo,
        });

        //Path View Parameters.
        var pathViewWidth = $('#path-view').css('width');
        if('0px' === pathViewWidth) 
            pathViewWidth = Constants.SliceViewWidth;
        
        var pathViewHeight = $('#path-view').css('height');
        if('0px' === pathViewHeight) 
            pathViewHeight = Constants.SliceViewHeight;
        
        console.log(sliceViewParams);

        var pathViewParams = {
            type:   Two.Types.svg, 
            width:  pathViewWidth, 
            height: pathViewHeight,
        };
        
        console.log(pathViewParams);
        
        var pathView = new PathPartItem({
            el:     $('#path-view'),
            part:   this.currDoc.part(), 
            params: pathViewParams, 
            who:    Constants.RendererTwo,
        });
    },

    reset: function(){
        //remove existing views - and recreate everything else.
    },

});
