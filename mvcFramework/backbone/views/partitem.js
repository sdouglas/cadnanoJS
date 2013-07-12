var PartItem = Backbone.View.extend({
    initialize: function(){
        this.who = this.options.who;
        this.params = this.options.params;
        this.handler = new viewHandler(this.who);
        this.handler.setParams(this.params);
        this.chosenHelixHash = new Array();
        this.connectSignalsSlots();
        console.log(this.handler);
    },

    connectSignalsSlots: function(){
        console.log(this.handler);
        console.log('connecting signals slots in partitem');
        this.listenTo(this.part,
            cadnanoEvents.partVirtualHelixAddedSignal,
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
    },

    createVirtualHelixItem: function(vh){
        //update the rendering of the item.
        this.vhItemSet.render();
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
        console.log(this.part);
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
        console.log('just called render');
        console.log($('#sliceView'));
    },

    setLattice: function(newCoords){
        for (var i in newCoords){
            this.emptyItemSet.createEmptyHelix(newCoords[i]);
        }
        this.part.initializedHelices(true);
    },
    partHelicesInitializedSlot: function(){
        console.log('received empty helices initialized signal');
        this.emptyItemSet.render();
    },
    partVirtualHelixAddedSlot: function(virtualHelix){
        //Add the virtual helix item to a hash.
        //Change the color of the virtual helix item
        //to show selection.
        console.log("currently in partVirtualHelixAddedSlot");

        this.createVirtualHelixItem(virtualHelix);
    },
    partRemovedSlot: function(){
        console.log(this.part);
        this.emptyItemSet.remove();
        this.vhItemSet.remove();
        //TODO: remove the if condition - a hack.
        if(this.handler){
        this.handler.remove();
        this.handler.render();
        delete this.handler;
        }
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
        //this.render();
    },
    connectPathSignalsSlots: function(){
        console.log(this.part);
        this.listenTo(this.part,
            cadnanoEvents.partActiveSliceResizedSignal,
            this.partActiveSliceResizedSlot
        );
	this.listenTo(this.part,
		      cadnanoEvents.partStepSizeChangedSignal,
		      this.partStepSizeChangedSlot
		      );
    },

    partVirtualHelixAddedSlot: function(virtualHelix){
	    this.pathItemSet.render();
        //TODO
        //Add in a new path in the path view panel.
    },

    partActiveSliceResizedSlot: function(){
    },

    partStepSizeChangedSlot: function(){
	this.pathItemSet.render();
    },

});
