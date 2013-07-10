/* MODELS HERE */
var VirtualHelixSet = Backbone.Collection.extend({
    model:VirtualHelix
});

var VirtualHelix = Backbone.Model.extend({
    initialize: function(){
        this.scafStrandSet = new Array();
        this.stapStrandSet = new Array();
        this.row = this.get('row');
        this.col = this.get('col');
        this.part = this.get('part');
        this.hID = this.get('hID');
        console.log(this);
    },
    getRow: function(){
        return this.row;
    },
    getCol: function(){
        return this.col;
    },
    getPart: function(){
        return this.part;
    },
});
