var PartItem = Backbone.View.extend({
    initialize: function(){
        this.who = this.options.who;
        this.params = this.options.params;
        this.handler = new viewHandler(this.who);
        this.handler.setParams(this.params);
        this.emptyHelixHash = new Array();
        this.connectSignalsSlots();
        console.log(this.handler);
    },

    connectSignalsSlots: function(){
        this.listenTo(this.part,
            cadnanoEvents.partVirtualHelixAddedSignal,
            this.partVirtualHelixAddedSlot
            );
    },

    spawnEmptyHelixItemAt: function(coord){
        helix = new VirtualHelixItem({
            pItem:      this, 
            row:        coord.row, 
            col:        coord.col, 
            handler:    this.handler
        });
        //console.log("Spawn helix " + 
        //    "row:" + coord.row + ", col:" + coord.col);
        
        //if(typeof this.emptyHelixHash[coord.row] === 'undefined'){
        //    this.emptyHelixHash[coord.row] = new Array();
        //}
        //this.emptyHelixHash[coord.row][coord.col] = helix;
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
        this.render();
    },
    render: function(){
        console.log(this.el);
        this.handler.addToDom(this.el);
        this.setLattice(this.part.generatorFullLattice());
        this.handler.render();
        console.log('just called render');
        console.log($('#sliceView'));
    },
    setLattice: function(newCoords){
        console.log(this);
        for (var i in newCoords){
            this.spawnEmptyHelixItemAt(newCoords[i]);
        }
    },
    partVirtualHelixAddedSlot: function(virtualHelix){
        //Add the virtual helix item to a hash.
        //Change the color of the virtual helix item
        //to show selection.
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
        this.render();
    },
    connectPathSignalsSlots: function(){
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
