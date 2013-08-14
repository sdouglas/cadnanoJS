/**
 * Each strand stores a reference to two other strands - which
 * are the cross over strands at its 3' and 5' ends. 
 * When a xover is created, three strands need to be updated in the
 * worst case - i.e. 3 strand objects - strandsets are automatically
 * updated.
 */
var Strand = Backbone.Model.extend({
    initialize: function(){
        this.baseIdxLow = this.get('baseIdxLow');
        this.baseIdxHigh = this.get('baseIdxHigh');
        this.strandSet = this.get('strandSet');
        this.helix = this.get('helix');
        this.strand5p = null;
        this.strand3p = null;
        console.log('Created strand object');
        this.setVars();
    },

    connection3p:
    function(){
        return this.strand3p;
    },

    connection5p:
    function(){
        return this.strand5p;
    },

    idx5Prime:
    function(){
        if(this.isDrawn5to3()) return this.low();
        return this.high();
    },

    idx3Prime:
    function(){
        if(this.isDrawn5to3()) return this.high();
        return this.low();
    },

    resize: function(low, high){
        console.log('just resized the strand');
        var newIdxs = new Array(low,high);
        this.undoStack().execute(new ResizeCommand(newIdxs, this));
    },

    /**
     * @param {type} 3 or 5 depending on prime.
     * returns array of size 2, with low and high indices.
     */
    getLowHighIndices: function(type){
        return this.strandSet.getLowHighIndices(this,type);
    },

    isDrawn5to3: function(){
        return this.strandSet.isDrawn5to3();
    },

    /**
     * TODO:
     * figure out what this does.
     */
    setVars:
        function(){
            if (this.isDrawn5to3()){
                this.connectionLow = this.connection5p;
                this.connectionHigh = this.connection3p;
                this.setConnectionLow = this.setConnection5p;
                this.setConnectionHigh = this.setConnection3p;
            }
            else {
                this.connectionLow = this.connection3p;
                this.connectionHigh = this.connection5p;
                this.setConnectionLow = this.setConnection3p;
                this.setConnectionHigh = this.setConnection5p;
            }
        },
    /**
     * @returns {idx} an object containing the low and 
     * high index of the strand.
     */
    idxs:
    function(){
        return new Array(this.baseIdxLow, this.baseIdxHigh);
    },

    setIdx: function(idx){
        console.log('just set the new indices');
        this.baseIdxLow = idx[0];
        this.baseIdxHigh = idx[1];
    },

    low: function(){
         return this.baseIdxLow;
    },

    high: function(){
          return this.baseIdxHigh;
    },

    undoStack:
    function(){
        return this.helix.undoStack;
    },

    setConnection5p:
    function(strand){
        this.strand5p = strand;
    },

    setConnection3p:
    function(strand){
        this.strand3p = strand;
    },

    hasXoverAt:
    function(idx){
        if(this.strand3p && this.idx3Prime() === idx) return true;
        if(this.strand5p && this.idx5Prime() === idx) return true;
        return false;
    },
});

var ResizeCommand = Undo.Command.extend({
    constructor:
    function(newIdxs, strand){
        this.currDoc = strand.helix.part.currDoc;
        this.helixId = strand.helix.id;
        this.scaffold = strand.strandSet.scaffold;
        this.newIdxs = newIdxs;
        this.oldIdxs = strand.idxs();
        console.log(this.oldIdxs);
        console.log(this.newIdxs);
        this.redo();
    },
    
    getModel:
    function(useNew){
        this.helix = this.currDoc.part().getModelHelix(this.helixId);
        if(this.scaffold) this.strandSet = this.helix.scafStrandSet;
        else this.strandSet = this.helix.stapStrandSet;
        //get the strand object.
        if(useNew) {
            this.strand = this.strandSet.getStrand(this.strandSet.getStrandIndex(this.newIdxs[0], this.newIdxs[1]));
        }
        else { 
            this.strand = this.strandSet.getStrand(this.strandSet.getStrandIndex(this.oldIdxs[0], this.oldIdxs[1]));
        }
    },

    undo:
    function(){
        this.getModel(true);
        console.log('in strand.js resizecommand undo');
        this.strand.setIdx(this.oldIdxs);

        this.strand.helix.part.trigger(cadnanoEvents.partStrandChangedSignal);
        this.strand.trigger(cadnanoEvents.strandUpdateSignal);
        
        //update the path view.
        //This signal has been renamed from partStrandChangedSignal
        this.strand.helix.part.trigger(cadnanoEvents.updatePreXoverItemsSignal,
            this.strand.strandSet.helix);
        this.strand.strandSet.trigger(cadnanoEvents.updateSkipInsertItemsSignal);
    },
    redo:
    function(){
        console.log('in strand.js resizecommand redo');
        this.getModel(false);
        //Assuming it can be added.
        //remove old strand from strandList
        //add new strand to strand list.

        this.strand.setIdx(this.newIdxs);
        console.log(this.newIdxs);
        this.strand.trigger(cadnanoEvents.strandUpdateSignal);
	//Note: I only need to update the 5p strand, since it
	//contains the xoveritem with it.
        if(this.strand.connection5p())
	    this.strand.connection5p().trigger(cadnanoEvents.strandUpdateSignal);

	this.strand.helix.part.trigger(cadnanoEvents.partStrandChangedSignal);

        //update the path view.
        this.strand.helix.part.trigger(cadnanoEvents.updatePreXoverItemsSignal,
            this.strand.strandSet.helix);
        this.strand.strandSet.trigger(cadnanoEvents.updateSkipInsertItemsSignal);
    },
    execute:
    function(){},
});
