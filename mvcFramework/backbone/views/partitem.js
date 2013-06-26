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
        helix = new VirtualHelixItem({
            pItem:      this, 
            row:        coord.row, 
            col:        coord.col, 
            handler:    this.handler
        });
        console.log("Spawn helix " + 
            "row:" + coord.row + ", col:" + coord.col);
        
        //if(typeof this.emptyHelixHash[coord.row] === 'undefined'){
        //    this.emptyHelixHash[coord.row] = new Array();
        //}
        //this.emptyHelixHash[coord.row][coord.col] = helix;
    },

});

var SlicePartItem = PartItem.extend({
    initialize: function(){
        this.part = this.options.part;
        this._super({part:this.options.part,param:this.options.params,who:this.options.who});
        this.render();
    },
    render: function(){
        console.log(this.el);
        this.handler.addToDom(this.el);
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
});

var PathPartItem = PartItem.extend({
    initialize: function(){
        this._super({
            part:   this.options.part,
            param:  this.options.params,
            who:    this.options.who
        });
    },
});
