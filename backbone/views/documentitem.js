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

    initialize: function(doc){
        this.currDoc = doc;
        this.listenTo(doc,'change',this.documentPartAddedSlot);
        console.log("called init");
    },

    documentPartAddedSlot: function(){
        console.log("called documentPartAddedSlot");
        //Slice View Parameters.
        var sliceViewWidth = $('#slice-view').css('width');
        if(null === sliceViewWidth) sliceViewWidth = Constants.defaultViewWidth;
        var sliceViewHeight = $('#slice-view').css('height');
        if(null === sliceViewHeight) sliceViewHeight = Constants.defaultViewHeight;

        var sliceViewParams = {type: Two.Types.svg, width: sliceViewWidth, height: sliceViewHeight};
        var sliceView = new SlicePartItem(this.currDoc.part(), sliceViewParams, Constants.RendererTwo);

        //Path View Parameters.
        var pathViewWidth = $('#path-view').css('width');
        if(null === pathViewWidth) pathViewWidth = Constants.defaultViewWidth;
        var pathViewHeight = $('#path-view').css('height');
        if(null === pathViewHeight) pathViewHeight = Constants.defaultViewHeight;

        var pathViewParams = {type: Two.Types.svg, width: pathViewWidth, height: pathViewHeight};
        var pathView = new PathPartItem(this.currDoc.part(), pathViewParams, Constants.RendererTwo);
    },

    reset: function(){
        //remove existing views - and recreate everything else.
    },

});
