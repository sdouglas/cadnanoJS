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
        this.id = this.get('id');

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

        //this.scafStrandSet.populateRandom();
        //this.stapStrandSet.populateRandom();
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
    
    /**
     * @param{idx} index at which strand is being searched for.
     * @param{stap} boolean variable to mention whether to search
     * in scaffold or staple strand set.
     * @return {true/false}
     */
    hasStrandAt: function(idx, stap){
        var ret = false;
        if(stap) ret= this.stapStrandSet.hasStrandAt(idx,idx);
        else ret= this.scafStrandSet.hasStrandAt(idx,idx);
        //console.log('checking at index:' + idx + ':' + ret);
        return ret;
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
