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
            helix: this,
        });
        this.stapStrandSet = new StrandSet({
            type: '',
            part: this.part,
            undoStack: this.undoStack,
            helix: this,
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

    isDrawn5to3: function(strandSet){
        if(strandSet.isScaffold() && this.isEvenParity())
            return true;
        if(strandSet.isStaple() && this.isOddParity())
            return true;
        return false;
    },

    isEvenParity: function(){
        return this.part.isEvenParity(this.row,this.col);
    },

    isOddParity: function(){
        return this.part.isOddParity(this.row,this.col);
    },

    getStrandSets:
    function(){
        return new Array(this.scafStrandSet, this.stapStrandSet);
    },

});
