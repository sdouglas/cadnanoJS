var StrandItem = Backbone.View.extend({
    initialize:
    function(){
        this.connectSignalsSlots();
    },
    
    events:
    {
    
    },

    connectSignalsSlots:
    function(){
        this.listenTo(cadnanoEvents.strandResizedSignal,
            this.strandResizedSlot);
    },

    strandResizedSlot:
    function(){
    },
});
