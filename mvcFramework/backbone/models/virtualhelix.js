/* MODELS HERE */
var VirtualHelixSet = Backbone.Collection.extend({
    model:VirtualHelix
});

var VirtualHelix = Backbone.Model.extend({
    initialize: function(){
        this.row = this.get('row');
        this.col = this.get('col');
        this.part = this.get('part');
        this.hID = this.get('hID');
        this.undoStack = this.get('undoStack');

        this.scafStrandSet = new StrandSet({
            type: Constants.ScaffoldStrand,
            part: this.part,
            undoStack: this.undoStack,
        });
        this.stapStrandSet = new StrandSet({
            type: '',
            part: this.part,
            undoStack: this.undoStack,
        });

        this.scafStrandSet.populateRandom();
        this.stapStrandSet.populateRandom();
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
    
    hasStrandAt: function(idx){
        return this.scafStrandSet.hasStrandAt(idx-1,idx+1);
    },

});
