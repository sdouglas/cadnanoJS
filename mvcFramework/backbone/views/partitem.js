var PartItem = Backbone.View.extend({
    initialize: function(modelPart,params,who){
        this.part = modelPart;
        console.log(who);
        this.handler = new viewHandler(who);
    },

    partVirtualHelixAddedSlot: function(virtualHelix){
    },

    spawnEmptyHelixItemAt: function(coord){
        helix = new VirtualHelixItem(this, coord.row, coord.column, this.handler);
        //this.emptyHelixHash[{coord.row,coord.column}] = helix;
        console.log("trying to spawn helix " + "row:" + coord.row + ", col:" + coord.col);
    },

});

var SlicePartItem = PartItem.extend({
    el: $("#slice-view"),
    initialize: function(modelPart,params,who){
        this._super(modelPart,params,who);
        this.setLattice(this.part.generatorFullLattice());
        this.handler.addTo(this.el);
    },
    setLattice: function(newCoords){
        for (var i in newCoords){
            this.spawnEmptyHelixItemAt(newCoords[i]);
        }
    },
    //
});

var PathPartItem = PartItem.extend({
    el: $("#path-view"),
    initialize: function(modelPart,params,who){
        this._super(modelPart,params,who);
        this.handler.addTo(this.el);
    },
});
