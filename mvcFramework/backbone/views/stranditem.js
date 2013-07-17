var StrandItem = Backbone.View.extend({
    initialize: function(eiL,eiR) {
	this.enditemL = eiL;
	this.enditemR = eiR;
	//check if the two enditem's certain properties are the same
	if(this.enditemL.centerY !== this.enditemR.centerY) {
	    alert("The enditems must be on same PathHelixItem and/or baseY!");
	}
	else {
	    alert("good");
	}
        this.connectSignalsSlots();
    },
    
    events:
    {
    
    },

    connectSignalsSlots: function() {
        this.listenTo(cadnanoEvents.strandResizedSignal,
		      this.strandResizedSlot);
    },

    strandResizedSlot: function() {
    },
});
