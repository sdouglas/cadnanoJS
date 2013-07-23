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

    resize: function(lowIdx, highIdx){
                console.log('just resized the strand');
        var newIdxs = {lowIdx: lowIdx, highIdx: highIdx};
        this.undoStack().execute(new ResizeCommand(newIdxs, this));
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
                this.idx5Prime = this.lowIdx;
                this.idx3Prime = this.highIdx;
                this.connectionLow = this.connection5p;
                this.connectionHigh = this.connection3p;
                this.setConnectionLow = this.setConnection5p;
                this.setConnectionHigh = this.setConnection3p;
            }
            else {
                this.idx5Prime = this.highIdx;
                this.idx3Prime = this.lowIdx;
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
        return {lowIdx: this.baseIdxLow, highIdx: this.baseIdxHigh};
    },

    setIdx:
    function(idx){
        this.baseIdxLow = idx.lowIdx;
        this.baseIdxHigh = idx.highIdx;
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
});

var ResizeCommand = Undo.Command.extend({
    constructor:
    function(newIdxs, strand){
        this.strand = strand;
        this.newIdxs = newIdxs;
        this.oldIdxs = this.strand.idxs();
        this.redo();
    },
    undo:
    function(){
        this.strand.setIdx(this.oldIdxs);
        this.strand.helix.part.trigger(cadnanoEvents.partStrandChangedSignal, this.oldIdxs);
        //update the path view.
        //This signal has been renamed from partStrandChangedSignal
        this.trigger(cadnanoEvents.updatePreXoverItemsSignal,
            this.strand.strandSet.helix);
    },
    redo:
    function(){
        //Assuming it can be added.
        //remove old strand from strandList
        //add new strand to strand list.

        this.strand.setIdx(this.newIdxs);
        this.strand.helix.part.trigger(cadnanoEvents.partStrandChangedSignal, this.newIdxs);
        //update the path view.
        this.strand.helix.part.trigger(cadnanoEvents.updatePreXoverItemsSignal,
            this.strand.strandSet.helix);
    },
    execute:
    function(){},
});

/*
var ResizeCommand = Undo.Command.extend({
    constructor:
    function(){},
    undo:
    function(){},
    redo:
    function(){},
    execute:
    function(){},
});
*/
