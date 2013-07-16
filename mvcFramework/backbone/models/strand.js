var Strand = Backbone.Model.extend({
    initialize:
    function(){
    },

    resize: 
    function(){
        this.trigger(cadnanoEvents.strandResizedSignal);
    },
});
