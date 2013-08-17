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
     * @param {onStack} Boolean variable specifying whether command
     * should be put on the undo stack.
     * TODO 
     * 1. Staple/Scaffold strand - this is based on 
     * which strand set it belongs to.
     * Figure the parity of the helix and make the 3' 5' ends
     * based on the same.
     */

    createStrand:
    function(startIdx, endIdx, onStack){
        var cmd;
        onStack = typeof onStack !== 'undefined' ? onStack : true;
        if(onStack)
            this.undoStack.execute(cmd = new CreateStrandCommand(this,startIdx,
						       endIdx, false));
        else 
            cmd = new CreateStrandCommand(this,startIdx, endIdx, false);
        return cmd.ret();
    },

    removeStrand:
    function(startIdx, endIdx, onStack){
        onStack = typeof onStack !== 'undefined' ? onStack : true;
        if(onStack)
            this.undoStack.execute(new CreateStrandCommand(this,startIdx,
						       endIdx, true));
        else 
            var cmd = new CreateStrandCommand(this,startIdx, endIdx, true);
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
    removeStrandRefs: function(strand){
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
     * @param [excludeStrand] Optional strand to be excluded
     * from the search.
     *
     * @returns {boolean} true if occupied at idx.
     * TODO:
     * Have to see whether the scaffold strand is present at this
     * location or not.
     */

    hasStrandAt: function(low,high,excludeStrand){
        var len = this.strandList.length;
        for(var i=0;i<len;i++){
            var obj = this.strandList[i];
            if(excludeStrand){
            if(obj.low() === excludeStrand.low() &&
               obj.high() === excludeStrand.high())
                continue;
            }
            if( (obj.low() >= low && obj.low() <= high) || 
                (obj.high() >= low && obj.high() <= high) || 
                (low >= obj.low() && low <= obj.high())){
                return true;
            }
        }
        return false;
    },

    getStrandAt: 
        function(idx){
            var len = this.strandList.length;
            for(var i=0;i<len;i++){
                var obj = this.strandList[i];
                if(obj.low() <= idx && obj.high() >= idx)
                        return obj;
            }
        },

    canBeResizedTo:
    function(strand, low, high){
        console.log('checking for resizing to positions:' +low + ',' + high+ ' from positions:' + strand.low() + ',' + strand.high());
        if(low >= high) return false;
        var curr = this.hasStrandAt(low,high,strand);
        return !curr;
    },

    /**
     * Assuming the strands are in sorted order in this.strandList
     * @param {strand} The strand for which the indices are to be 
     * calculated
     * @param [type] Optional argument, if 3 or 5, will return the 
     * surrounding indices where it can be extended for the endpoints,
     * else will return the surrounding indices for the entire strand.
     */
    getLowHighIndices:
    function(strand,type){
        var len = this.strandList.length;
        var ret = new Array(0,this.part.getStep()*this.part.getStepSize()-1);
        var flag = true;
        for(var i=0;i<len;i++){
            var obj = this.strandList[i];
            if(obj.low() === strand.low() && obj.high() === strand.high())
                continue;
            if(obj.high() < strand.low())
                ret[0] = obj.high()+1;
            if(flag && obj.low() > strand.high()){
                ret[1] = obj.low()-1;
                flag = false;
                //no more high strand settings.
            }
        }
        if(type === 3){
            if(this.isDrawn5to3())
                ret[0] = strand.low()+1;
            else
                ret[1] = strand.high()-1;
        }
        else if (type === 5){
            if(this.isDrawn5to3())
                ret[1] = strand.high()-1;
            else
                ret[0] = strand.low()+1;
        
        }
        return ret;
    },

    isDrawn5to3:
    function(){
        return this.helix.isDrawn5to3(this);
    },

    hasNoStrandAtOrNoXover:
    function(index){
        var strand = this.getStrandAt(index);
        if(strand && strand.hasXoverAt(index)) return false;
        return true;
    },

    /**
     * Returns a js object, containing the positions
     * of each strand in the strand set. Each strandset
     * contains 0--maxBaseIdx positions. At each position p
     * there are 4 values v[0] - v[3] stored. 
     * v[0] = helix number of 5' end of strand at index p-1.
     * v[1] = position of 5' end of strand at index p-1.
     * v[2] = helix number of 3' end of strand at index p+1.
     * v[3] = position of 3' end of strand at index p+1.
     */
    getLegacyArray:
    function(){
        /**
         * go through every index from 0 to maxbaseidx.
         * initialize all to -1.
         * go through every strand, and for each strand
         * get its low,high,isdrawn5to3.
         *
         */
        var ret = new Array();
        for(var i=0;i<this.part.maxBaseIdx();i++){
            ret[i] = [-1,-1,-1,-1];
        }
        if(this.isDrawn5to3()){
            var len = this.strandList.length;
            for(var i=0;i<len;i++){
                var strand = this.strandList[i];
                var low = strand.low();
                var high = strand.high();
                var hnum = this.helix.hID;
                //check if there is a crossover. get the
                //index of the l
                if(strand.connection5p()){
                    var strand5p = strand.connection5p();
                    ret[low][0] = strand5p.helix.hID;
                    ret[low][1] = strand5p.idx3Prime();
                    console.log('strand has 3p 5to3 conn:' + ret[low][0]
                            + ',' + ret[low][1]);
                }
                ret[low][2] = hnum;
                ret[low][3] = low+1;
                for(var pos=low+1; pos<high; pos++){
                    ret[pos][0] = hnum;
                    ret[pos][1] = pos-1;
                    ret[pos][2] = hnum;
                    ret[pos][3] = pos+1;
                }
                ret[high][0] = hnum;
                ret[high][1] = high-1;
                if(strand.connection3p()){
                    var strand3p = strand.connection3p();
                    ret[high][2] = strand3p.helix.hID;
                    ret[high][3] = strand3p.idx5Prime();
                    console.log('strand has 3p 5to3 conn:' + ret[high][2]
                            + ',' + ret[high][3]);
                }
            }
        }
        else{
            var len = this.strandList.length;
            for(var i=0;i<len;i++){
                var strand = this.strandList[i];
                var low = strand.low();
                var high = strand.high();
                var hnum = this.helix.hID;
                //check if there is a crossover. get the
                //drawn from 3 to 5. The lower index will
                //be connected to a 3p strand, and the higher
                //index will connect from a 5p strand..
                if(strand.connection3p()){
                    var strand3p = strand.connection3p();
                    ret[low][2] = strand3p.helix.hID;
                    ret[low][3] = strand3p.idx5Prime();
                    console.log('strand has 3p conn:' + ret[low][2]
                            + ',' + ret[low][3]);
                }
                ret[low][0] = hnum;
                ret[low][1] = low+1;
                for(var pos=low+1; pos<high; pos++){
                    ret[pos][0] = hnum;
                    ret[pos][1] = pos+1;
                    ret[pos][2] = hnum;
                    ret[pos][3] = pos-1;
                }
                ret[high][2] = hnum;
                ret[high][3] = high-1;
                if(strand.connection5p()){
                    var strand5p = strand.connection5p();
                    ret[high][0] = strand5p.helix.hID;
                    ret[high][1] = strand5p.idx3Prime();
                    console.log('strand has 5p conn:' + ret[high][0]
                            + ',' + ret[high][1]);
                }
            }
        }
        return ret;
    },

    /**
     * TODO: check if the connected strands are atleast 1-2 
     * bases long. 
     */
    canSplitStrand:
    function(strand, idx){
        var low = strand.low();
        var high = strand.high();
        if(idx > low+1 && idx < high-1) return true;
        if(idx <= low+1) {
            //check if there is a connecting strand.
            if(strand.isDrawn5to3()){
                if(strand.strand5p) return true;
            }
            else{
                if(strand.strand3p) return true;
            }
            return false;
        }
        //The only case left is if idx >= high-1.
        if(strand.isDrawn5to3()){
            if(strand.strand3p) return true;
        }
        else{
            if(strand.strand5p) return true;
        }
        return false;
    },

    splitStrand:
    function(strand, idx, onStack){
        onStack = typeof onStack !== 'undefined' ? onStack : true;
        var cmd;
        if(onStack)
            this.undoStack.execute(cmd = new SplitCommand(this,strand,idx));
        else
            cmd = new SplitCommand(this,strand,idx);
        return cmd.ret();
    },

    getHelix:
    function(){
        return this.helix;
    },

    complementStrandSet:
    function(){
        if(this.scaffold)
            return this.getHelix().stapStrandSet;
        return this.getHelix().scafStrandSet;
    },

});

var CreateStrandCommand = Undo.Command.extend({
    constructor:
    function(strandSet, startIdx, endIdx, isInverse){
        //Need the following:
        //helix
        this.currDoc = strandSet.helix.part.currDoc;
        this.helixId = strandSet.helix.id;
        this.scaffold = strandSet.scaffold;
        this.startIdx = startIdx;
        this.endIdx = endIdx;
        this.isInverse = isInverse;
        if(this.isInverse){
            this.redo = this.delStrand;
            this.undo = this.addStrand;
        }
        else{
	        console.log('reversing the create strand command - not');
            this.undo = this.delStrand;
            this.redo = this.addStrand;
        }
        this.redo();
    },

    ret:
    function(){
        if(this.strand) return this.strand;
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
        console.log(this.strandSet);

        this.strand = this.strandSet.getStrand(this.strandSet.getStrandIndex(this.startIdx,this.endIdx));
        console.log(this.startIdx+':'+this.endIdx);
    },

    delStrand: 
    function(){
        console.log('in delstrand of createstrandcommand');
        //destroy the strand object.
        //The sequence of these statements is important.
        this.getModel();
        console.log(this.strand);
        this.strandSet.trigger(cadnanoEvents.strandSetStrandRemovedSignal, this.strand);
        var ret = this.strandSet.removeStrandRefs(this.strand);
        //this.helix.part.trigger(cadnanoEvents.partStrandChangedSignal);
        this.strandSet.part.trigger(cadnanoEvents.updatePreXoverItemsSignal,
                    this.strandSet.helix);
        if(this.strandSet.isScaffold())
            this.helix.part.trigger(cadnanoEvents.partActiveSliceResizeSignal);
        this.strand.destroy();
        console.log('received :' + ret + ', to remove strand');
    },
    addStrand:
    function(){
        console.log('in addstrand of createstrandcommand');
        this.getModel();
        //Create a strand object.
        //And add it to the strand list.
        var strand = new Strand({
            baseIdxLow: this.startIdx, 
            baseIdxHigh: this.endIdx,
            strandSet: this.strandSet,
            helix: this.strandSet.helix,
        });
        this.strandSet.insert(strand);
        this.strand = strand;
        this.strandSet.trigger(cadnanoEvents.strandSetStrandAddedSignal,
                strand, this.strandSet.helix.hID);
        //this.strandSet.part.trigger(cadnanoEvents.partStrandChangedSignal);
        this.strandSet.part.trigger(cadnanoEvents.updatePreXoverItemsSignal,
                    this.strandSet.helix);
        if(this.strandSet.isScaffold()){
            console.log('just triggered helix add signal');
            this.helix.part.trigger(cadnanoEvents.partVirtualHelixAddedSignal, this.helix);
        }
    },
    execute:
    function(){},
});

/**
 * The assumption is that when this command is called,
 * the strand can be split.
 */
var SplitCommand = Undo.Command.extend({
    constructor:
    function(strandSet, strand, idx){
        this.currDoc = strandSet.helix.part.currDoc;
        this.helixId = strandSet.helix.id;
        this.scaffold = strandSet.scaffold;
        this.startIdx = strand.low();
        this.endIdx = strand.high();
        this.breakIdx = idx;
        //Update the endpointitems/xovers.
        this.redo();
    },
    getModel:
    function(){
        this.helix = this.currDoc.part().getModelHelix(this.helixId);
        if(this.scaffold) this.strandSet = this.helix.scafStrandSet;
        else this.strandSet = this.helix.stapStrandSet;
        //old strand
        this.oS = this.strandSet.getStrand(this.strandSet.getStrandIndex(this.startIdx,this.endIdx));
    },

    undo:
    function(){
        console.log('in undo of Splitcommand');
        this.getModel();
        this.strandL = this.strandSet.getStrand(this.strandSet.getStrandIndex(this.startIdx,this.breakIdx));
        this.strandR = this.strandSet.getStrand(this.strandSet.getStrandIndex(this.breakIdx+1,this.endIdx));

        var lS = this.strandL;
        var rS = this.strandR;

        this.strand = this.strandSet.createStrand(this.startIdx, this.endIdx, false);
        if(this.strandSet.isDrawn5to3()){
            this.strand.setConnection5p(lS.strand5p);
            this.strand.setConnection3p(rS.strand3p);
        }
        else{
            this.strand.setConnection5p(rS.strand5p);
            this.strand.setConnection3p(lS.strand3p);
        }

        //TODO: create another version of removeStrand
        //that accepts strand directly as input.
        this.strandSet.removeStrand(this.startIdx, this.breakIdx, false);
        this.strandSet.removeStrand(this.breakIdx+1, this.endIdx, false);
    },

    redo:
    function(){
        console.log('in redo of Splitcommand');
        this.getModel();
        this.strandL = this.strandSet.createStrand(
                this.startIdx, this.breakIdx, false);
        this.strandR = this.strandSet.createStrand(
                this.breakIdx+1,this.endIdx, false);

        if(this.strandSet.isDrawn5to3()){
            //left strand 3' end is at idx.
            //right strand 5' end is at idx+1.
            //left strand takes 5' end of strand object.
            this.strandL.setConnection5p(this.oS.strand5p);
            this.strandR.setConnection3p(this.oS.strand3p);
        }
        else{
            this.strandL.setConnection3p(this.oS.strand3p);
            this.strandR.setConnection5p(this.oS.strand5p);
        }
        this.strandSet.removeStrand(this.startIdx,this.endIdx, false);
        //TODO: someone should listen to these signals.
        this.strandL.trigger(cadnanoEvents.strandUpdateSignal);
        this.strandR.trigger(cadnanoEvents.strandUpdateSignal);
    },

    ret: function(){
        return new Array(this.strandL, this.strandR);
    },
    execute: function(){},
});
