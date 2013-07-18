var PartItem = Backbone.View.extend({
    initialize: function(){
        this.who = this.options.who;
        this.params = this.options.params;
        this.handler = new viewHandler(this.who);
        this.handler.setParams(this.params);
        this.chosenHelixHash = new Array();
        this.connectSignalsSlots();
    },

    connectSignalsSlots: function(){
        this.listenTo(this.part,
            cadnanoEvents.partVirtualHelixAddedSignal,
            this.partVirtualHelixAddedSlot
            );
        this.listenTo(this.part,
            cadnanoEvents.partVirtualHelixRemovedSignal,
            this.partVirtualHelixAddedSlot
            );
        this.listenTo(this.part,
            cadnanoEvents.partHelicesInitializedSignal,
            this.partHelicesInitializedSlot
            );
        this.listenTo(this.part,
            cadnanoEvents.partRemovedSignal,
            this.partRemovedSlot
            );
        this.listenTo(this.part,
            cadnanoEvents.partActiveSliceResizedSignal,
            this.partActiveSliceResizedSlot
        );
    },

    isHelixSelected: function(row,col){
        if(this.chosenHelixHash[row][col])
            return true;
        return false;
    },
});

var SlicePartItem = PartItem.extend({
    initialize: function(){
        this.part = this.options.part;
        this._super({
            part:   this.options.part,
            param:  this.options.params,
            who:    this.options.who,
        });
        //Create the empty helix set layer.
        this.emptyItemSet = new EmptyHelixSetItem({
            el: $('#sliceView'),
            part: this.options.part,
            handler: this.handler,
        });
        this.setLattice(this.part.generatorFullLattice());

        //Create the virtual helix item layer.
        this.vhItemSet = new VirtualHelixSetItem({
            el: $('#sliceView'),
            part: this.options.part,
            handler: this.handler,
            collection: this.options.part.getVHSet(),
        });

        //Create the text item layer.
        
        //console.log(this.el);
        //this.handler.addToDom(this.el);
    },
    
    render: function(){
        this.handler.render();
    },

    setLattice: function(newCoords){
        for (var i in newCoords){
            this.emptyItemSet.createEmptyHelix(newCoords[i]);
        }
        this.part.initializedHelices(true);
    },
    partHelicesInitializedSlot: function(){
        this.emptyItemSet.render();
    },
    partVirtualHelixAddedSlot: function(virtualHelix){
        //Add the virtual helix item to a hash.
        //Change the color of the virtual helix item
        //to show selection.
        this.vhItemSet.render();

    },

    partRemovedSlot: function(){
        console.log(this.part);
        this.emptyItemSet.close();
        this.emptyItemSet.remove();
        this.vhItemSet.close();
        this.vhItemSet.remove();
        //TODO: remove the if condition - a hack.
        if(this.handler){
            this.handler.remove();
            this.handler.render();
            delete this.handler;
        }
    },

    partActiveSliceResizedSlot: function(){
        //Check each helix, and see which
        //ones fall under the scaffold, and which ones
        //do not.
        this.vhItemSet.render();
    },

    //TODO
    //addScafifStapIsMissing
    //addStapifScafIsMissing

});

var PathPartItem = PartItem.extend({
    initialize: function(){
        this.part = this.options.part;
        this._super({
            part:   this.options.part,
            param:  this.options.params,
            who:    this.options.who,
        });
        this.connectPathSignalsSlots();
        this.pathItemSet = new PathHelixSetItem({
            el: $('#pathView'),
            part: this.options.part,
            handler: this.handler,
            collection: this.options.part.getVHSet(),
        });

        //PreXoverItems are stored here.
        this.preXoverItems = [];
    },
    connectPathSignalsSlots: function(){
        this.listenTo(this.part,
            cadnanoEvents.updatePreXoverItemsSignal,
            this.updatePreXoverItemsSlot);
	this.listenTo(this.part,
		      cadnanoEvents.partStepSizeChangedSignal,
		      this.partStepSizeChangedSlot
		      );
    },

    partVirtualHelixAddedSlot: function(virtualHelix){
	this.pathItemSet.renderBack();
	this.pathItemSet.activesliceItem.updateHeight();
        //TODO
        //Add in a new path in the path view panel.
    },

    updatePreXoverItemsSlot:
    function(virtualHelix){
        console.log('in updatePreXoverItemsSlot');
        this.part.potentialCrossoverList(virtualHelix);
        //3. Remove all current prexoveritems.
        //empty the layer containing the prexoveritems.
        //this.preXoverItemsLayer.removeChildren();
        //
        //1. Get the vhitem.
        //2. Get the potential crossovers locations.
        //4. Create new prexover items at these locations.
        //Get active virtual helix item.
        //Re-render the xover items.
    },

    partStepSizeChangedSlot: function(){
	var slicebar = this.pathItemSet.activesliceItem;
	var pCounter = slicebar.counter;
	slicebar.adjustCounter(slicebar.counter);
	if(slicebar.counter !== pCounter) {
	    slicebar.group.setX(slicebar.counter*slicebar.sqLength+2*Math.floor(slicebar.counter/slicebar.divLength));
            slicebar.counterText.setText(slicebar.counter);
            slicebar.counterText.setOffset({x: slicebar.counterText.getWidth()/2});
	}
	this.pathItemSet.renderBack();
    },

});
