var Strand = Backbone.Model.extend({
    initialize:
    function(){
        this.startId = this.get('startId');
        this.endId = this.get('endId');
        console.log('Created strand object');
    },

    resize: 
    function(){
        this.trigger(cadnanoEvents.strandResizedSignal);
    },
});
