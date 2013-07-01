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
        this.listenTo(this.part,
            cadnanoEvents.partVirtualHelixAddedSignal,
            this.partVirtualHelixAddedSlot
            );
        this.listenTo(this.part,
            cadnanoEvents.partHelicesInitializedSignal,
            this.partHelicesInitializedSlot
            );
    },

    spawnEmptyHelixItemAt: function(coord){
        this.part.createVirtualHelix(coord.row, coord.col);
    },

    addVirtualHelixItem: function(vhItem, row, col){
        console.log(row + "," + col);
        if(!this.chosenHelixHash[row]){
            this.chosenHelixHash[row] = new Array();
        }
        this.chosenHelixHash[row][col] =  vhItem;
        console.log(this.chosenHelixHash);
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
        vhItemSet = new VirtualHelixSetItem({
            el:$('#sliceView'),
            collection: this.part.virtualHelixSet,
            handler: this.handler,
        });
        console.log(this.handler);

        //console.log(this.el);
        //this.handler.addToDom(this.el);
        console.log(this.part.generatorFullLattice());
        //this.setLattice(this.part.generatorFullLattice());
    },
    
    events: {
        "click" :   "sliceViewClicked",
    },

    sliceViewClicked: function(){
        console.log("clicked the slice view");
    },

    render: function(){
        this.handler.render();
        console.log('just called render');
        console.log($('#sliceView'));
    },

    setLattice: function(newCoords){
        console.log(this);
        for (var i in newCoords){
            this.spawnEmptyHelixItemAt(newCoords[i]);
        }
        this.part.initializedHelices(true);
    },
    partHelicesInitializedSlot: function(){
        console.log('received helix added signal');
        vhItemSet.render();
    },
    partVirtualHelixAddedSlot: function(virtualHelix){
        //Add the virtual helix item to a hash.
        //Change the color of the virtual helix item
        //to show selection.
        console.log("currently in partVirtualHelixAddedSlot");
        this.addVirtualHelixItem(virtualHelix, 
                virtualHelix.getRow(),
                virtualHelix.getCol()
        );
    },
    //TODO
    //addScafifStapIsMissing
    //addStapifScafIsMissing

});

var PathPartItem = PartItem.extend({
    initialize: function(){
        this._super({
            part:   this.options.part,
            param:  this.options.params,
            who:    this.options.who,
        });
        this.connectPathSignalsSlots();
        //this.render();
    },
    connectPathSignalsSlots: function(){
        console.log(this.part);
        this.listenTo(this.part,
            cadnanoEvents.partActiveSliceResizedSignal,
            this.partActiveSliceResizedSlot
        );
    },

    partVirtualHelixAddedSlot: function(virtualHelix){
        //TODO
        //Add in a new path in the path view panel.
    },
    partActiveSliceResizedSlot: function(){
    },
});
