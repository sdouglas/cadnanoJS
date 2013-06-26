var PartItem = Backbone.View.extend({
    initialize: function(){
        console.log(this.options.who);
        this.who = this.options.who;
        this.params = this.options.params;
        this.handler = new viewHandler(this.who);
        this.handler.setParams(this.params);
        this.emptyHelixHash = new Array();
    },

    partVirtualHelixAddedSlot: function(virtualHelix){
    },

    spawnEmptyHelixItemAt: function(coord){
        //console.log("trying to spawn helix " + "row:" + coord.row + ", col:" + coord.col);
        helix = new VirtualHelixItem({pItem: this, row:coord.row, col:coord.col, handler: this.handler});
        //helix = new VirtualHelixItem(this, coord.row, coord.column, this.handler);
        console.log(this);
        if(typeof this.emptyHelixHash[coord.row] === 'undefined'){
            this.emptyHelixHash[coord.row] = new Array();
        }
        this.emptyHelixHash[coord.row][coord.col] = helix;
    },

});

var SlicePartItem = PartItem.extend({
//var SlicePartItem = Backbone.View.extend({
    el: $("#slice-view"),
    initialize: function(){
        this.part = this.options.part;
        this._super({part:this.options.part,param:this.options.params,who:this.options.who});
        console.log(this.handler);
        var elem = $('#slice-view');
        console.log(elem);
        this.render();
    },
    render: function(){
        this.handler.addTo(this.$el);
        this.setLattice(this.part.generatorFullLattice());
        this.handler.render();
        console.log('just called render');
    },
    setLattice: function(newCoords){
        console.log(this);
        for (var i in newCoords){
            this.spawnEmptyHelixItemAt(newCoords[i]);
        }
    },
    //
});

//var PathPartItem = PartItem.extend({
var PathPartItem = Backbone.View.extend({
    el: $("#path-view"),
    initialize: function(){
        this._super({part:this.options.part,param:this.options.params,who:this.options.who});
        //var elem = $('#path-view');
        //this.handler.addTo(elem[0]);
    },
});
