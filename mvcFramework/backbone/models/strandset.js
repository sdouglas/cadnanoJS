var StrandSet = Backbone.Model.extend({
    initialize: 
    function(){
        this.strandList = [];
        this.part = this.get('part');
        this.undoStack = this.get('undoStack');
        this.helix = this.get('helix');
        this.scaffold = false;
        if(this.get('type') === Constants.ScaffoldStrand){
            this.scaffold = true;
        }
    },

    /**
     * Creates a new strand and pushes the action
     * onto the undostack.
     * Triggers a signal that updates the path view.
     * @param {startIdx} This is the strand starting position.
     * @param {endIdx} This is the strand ending position.  
     * TODO 
     * 1. Staple/Scaffold strand - this is based on 
     * which strand set it belongs to.
     * Figure the parity of the helix and make the 3' 5' ends
     * based on the same.
     */

    createStrand:
    function(startIdx, endIdx){
        this.undoStack.execute(new CreateStrandCommand(this,startIdx,
                endIdx));
    },

    /**
     * Insert a new strand into the strand set.
     * @param {strand} strand model object.
     * TODO: insert it in the right position, sorting becomes
     * easier later on.
     */
    insert: function(strand){
        var len = this.strandList.length;
        for(var i=0; i<len;i++){
            if(strand.high() < this.strandList[i].low())
                break;
        }
        this.strandList.splice(i,0,strand);
        console.log(this.strandList);
    },

    getStrandIndex: 
    function(lowIdx, highIdx){
        var len = this.strandList.length;
        for(var i=0; i<len;i++){
            if(lowIdx === this.strandList[i].low() &&
               highIdx === this.strandList[i].high()) {
                return i;
            }
        }
        return -1;
    },

    getStrand: function(index){
        return this.strandList[index];
    },

    /**
     * @param {strand} Strand model object.
     * returns true if found the model strand and deleted it. Else false.
     */
    removeStrand: function(strand){
        var i = this.getStrandIndex(strand.baseIdxLow, strand.baseIdxHigh);
        if(i !== -1) {
            this.strandList.splice(i,1);
            return true;
        }
        return false;
    },

    isStaple:
    function(){
        return !this.scaffold;
    },

    isScaffold:
    function(){
        return this.scaffold;
    },

    /**
     * Check if there exists a strand in an interval.
     * @param {low} The lower base position from which
     * the strand needs to be checked.
     * @param {high} The higher base position upto which
     * the strand needs to be checked.
     *
     * @returns {boolean} true if occupied at idx.
     * TODO:
     * Have to see whether the scaffold strand is present at this
     * location or not.
     */

    hasStrandAt: function(low,high){
        var len = this.strandList.length;
        for(var i=0;i<len;i++){
            var obj = this.strandList[i];
            if( (obj.low() >= low && obj.low() <= high) || 
                (obj.high() >= low && obj.high() <= high) || 
                (low >= obj.low() && low <= obj.high())){
                return true;
            }
        }
        return false;
    },

    populateRandom: function(){
        for(var i=0;i<10;i++){
            //var start = Math.round(Math.random()*100)%42;
            //var end = Math.round(Math.random()*100)%42;
            var start = i*7;
            var end = start+3;
            
            if(start>end){
                var tmp = start;
                start = end;
                end = tmp;
            }
            var obj = {st: start, end: end};
            this.strandList.push(obj);
        }
    },

    isDrawn5to3:
    function(){
        return this.helix.isDrawn5to3(this);
    },

    hasNoStrandAtOrNoXover:
    function(index){
        return true;
    },

});

var CreateStrandCommand = Undo.Command.extend({
    constructor:
    function(strandSet, startIdx, endIdx){
        //Need the following:
        //helix
        this.currDoc = strandSet.helix.part.currDoc;
        this.helixId = strandSet.helix.id;
        console.log(this.helixId);
        this.scaffold = strandSet.scaffold;
        this.startIdx = startIdx;
        this.endIdx = endIdx;
        this.redo();
    },
    getModel:
    function(){
        //get the helix from the helixid - since that doesn't change
        //even if the helix is deleted.
        //Then get the strand set.
        //Then get the strand start and end positions.
        this.helix = this.currDoc.part().getModelHelix(this.helixId);
        if(this.scaffold) this.strandSet = this.helix.scafStrandSet;
        else this.strandSet = this.helix.stapStrandSet;
    },
    undo: 
    function(){
        //destroy the strand object.
        //The sequence of these statements is important.
        this.getModel();
        this.strandSet.trigger(cadnanoEvents.strandSetStrandRemovedSignal, this.strand);
        var ret = this.strandSet.removeStrand(this.strand);
        this.helix.part.trigger(cadnanoEvents.partStrandChangedSignal);
        this.strand.destroy();
        console.log('received :' + ret + ', to remove strand');
    },
    redo:
    function(){
        console.log('calling redo for strandset');
        this.getModel();
        //Create a strand object.
        //And add it to the strand list.
        var strand = new Strand({
            baseIdxLow: this.startIdx, 
            baseIdxHigh: this.endIdx,
            strandSet: this.strandSet,
            helix: this.strandSet.helix,
        });
        console.log(this.startIdx + ',' + this.endIdx);
        this.strandSet.insert(strand);
        this.strandSet.trigger(cadnanoEvents.strandSetStrandAddedSignal,
                strand, this.strandSet.helix.hID);
        this.strandSet.part.trigger(cadnanoEvents.partStrandChangedSignal);
        this.strandSet.part.trigger(cadnanoEvents.updatePreXoverItemsSignal,
                    this.strandSet.helix);
        this.strand = strand;
    },
    execute:
    function(){},
});

/*
     part(self):
     document(self):
     generatorStrand(self):
     isDrawn5to3(self):
     isStaple(self):
     isScaffold(self):
     getNeighbors(self, strand):
     complementStrandSet(self):
     getBoundsOfEmptyRegionContaining(self, baseIdx):
     indexOfRightmostNonemptyBase(self):
     partMaxBaseIdx(self):
        """Return the bounds of the StrandSet as ined in the part."""
     strandCount(self):
     strandType(self):
     createStrand(self, baseIdxLow, baseIdxHigh, useUndoStack=True):
     createDeserializedStrand(self, baseIdxLow, baseIdxHigh, useUndoStack=False):
     removeStrand(self, strand, strandSetIdx=None, useUndoStack=True, solo=True):
     removeAllStrands(self, useUndoStack=True):
     mergeStrands(self, priorityStrand, otherStrand, useUndoStack=True):
     strandsCanBeMerged(self, strandA, strandB):
     splitStrand(self, strand, baseIdx, updateSequence=True, useUndoStack=True):
        Break strand into two strands. Reapply sequence by ault (disabled
     strandCanBeSplit(self, strand, baseIdx):
     destroy(self):
     remove(self, useUndoStack=True):
     undoStack(self):
     virtualHelix(self):
     strandFilter(self):
     hasStrandAt(self, idxLow, idxHigh):
     getOverlappingStrands(self, idxLow, idxHigh):
     hasStrandAtAndNoXover(self, idx):
     hasNoStrandAtOrNoXover(self, idx):
     getIndexToInsert(self, idxLow, idxHigh):
     getStrand(self, baseIdx):
     getLegacyArray(self):
     _addToStrandList(self, strand, idx):
     _removeFromStrandList(self, strand):
     _couldStrandInsertAtLastIndex(self, strand):
     _findOverlappingRanges(self, qstrand, useCache=False):
                # use a next and a ault to cause a break condition
     getStrandIndex(self, strand):
     _findIndexOfRangeFor(self, strand):
     _doesLastSetIndexMatch(self, qstrand, strandList):
         __init__(self, strandSet, baseIdxLow, baseIdxHigh, strandSetIdx):
         redo(self):
         undo(self):
         __init__(self, strandSet, strand, strandSetIdx, solo=True):
         redo(self):
         undo(self):
         __init__(self, strandLow, strandHigh, lowStrandSetIdx, priorityStrand):
         redo(self):
         undo(self):
         __init__(self, strand, baseIdx, strandSetIdx, updateSequence=True):
         redo(self):
         undo(self):
     deepCopy(self, virtualHelix):
     */
