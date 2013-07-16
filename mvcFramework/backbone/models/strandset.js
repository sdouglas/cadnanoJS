var StrandSet = Backbone.Model.Extend({
    initialize: 
    function(type){
        this.strandList = [];
        this.part = this.options.part;
        this.helix = this.options.helix;
        this.undoStack = this.options.undoStack;
        this.scaffold = false;
        if(type === Constants.ScaffoldStrand){
            this.scaffold = true;
        }
    },

    createStrand:
    function(startIdx, endIdx){
        //TODO
        //1. Staple/Scaffold strand - this is based on 
        //which strand set it belongs to./
        //Figure the parity of the strand and make the 3' 5' ends
        //based on the same.
        this.undoStack.execute(new CreateStrandCommand(this,startIdx,
                endIdx));
    },

    insert:
        //TODO: insert it in the right position, sorting becomes
        //easier later on.
    function(strand){
        this.strandSet.push(strand);
    },

    isStaple:
    function(){
        return !this.scaffold;
    },

    isScaffold:
    function(){
        return this.scaffold;
    },
    
});

var CreateStrandCommand = Undo.Command.extend({
    constructor:
    function(strandSet, startIdx, endIdx){
        this.strandSet = strandset;
        this.redo(startIdx, endIdx);
    },
    undo: 
    function(){
        //destroy the strand object.
        this.strand.destroy();
        //this.strandSet.trigger(cadnanoEvents.strandSetStrandRemovedSignal);
    },
    redo:
    function(startIdx, endIdx){
        //Create a strand object.
        //And add it to the strand list.
        var strand = new Strand(startIdx, endIdx);
        this.strandSet.insert(strand);
        this.strandSet.trigger(cadnanoEvents.strandSetStrandAddedSignal);
        this.strandSet.part.trigger(cadnanoEvents.partStrandChangedSignal);
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
