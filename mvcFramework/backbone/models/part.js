var Crossovers = {
    honeycombScafLow: [[1, 11], [8, 18], [4, 15]],
    honeycombScafHigh: [[2, 12], [9, 19], [5, 16]],
    honeycombStapLow: [[6], [13], [20]],
    honeycombStapHigh: [[7], [14], [0]],
    squareScafLow : [[4, 26, 15], [18, 28, 7], [10, 20, 31], [2, 12, 23]],
    squareScafHigh : [[5, 27, 16], [19, 29, 8], [11, 21, 0], [3, 13, 24]],
    squareStapLow : [[31], [23], [15], [7]],
    squareStapHigh : [[0], [24], [16], [8]],
};
          
var Part = Backbone.Model.extend({
    step: 2,
    stepSize: 21,
    radius: 20,
    turnsPerStep:2,
    helicalPitch: this.step/this.turnsPerStep,
    twistPerBase: 360/this.helicalPitch,
    maxRow: 10,
    maxCol: 10,
    maxRowsEver: 1000,
    root3: 1.732051,
    largestUnusedOddNumber: -1,
    largestUnusedEvenNumber: -2,
    origin: 40,                    //In order to shift away from the origin.
    //TODO: what is this used for in cadnano2?
    //radius: 1.125,

    initialize: function(){
        console.log("added a new part");
        this.chosenHelixHash = new Array();
        this.virtualHelixSet = new VirtualHelixSet();
        this.virtualHelixSet.reset();

        this.oddRecycleBin = new minHeap();
        this.evenRecycleBin = new minHeap();

        this.activeIdx = (this.step-1)*21;
        this.init();
    },

    getVHSet: function(){
        return this.virtualHelixSet;
    },
    
    setDoc: function(doc){
        this.currDoc = doc;
    },

    getDoc: function(){
    	return this.currDoc;
    },

    undoStack: function(){
        return this.currDoc.undostack;
    },

    addVirtualHelix: function(helix){
        if(!this.chosenHelixHash[helix.getRow()]){
            this.chosenHelixHash[helix.getRow()] = new Array();
        }
        this.chosenHelixHash[helix.getRow()][helix.getCol()] = helix;
        //Add to the backbone collection.
        this.virtualHelixSet.add(helix);
    },

    removeVirtualHelix: 
    function(helix){
       delete this.chosenHelixHash[helix.getRow()][helix.getCol()];
       this.virtualHelixSet.remove(helix); 

       //Remove the views.
       this.trigger(cadnanoEvents.partVirtualHelixRemovedSignal,
         helix);
       //this.trigger(cadnanoEvents.partActiveSliceResizedSignal, 
       //  helix);
    },
    
    initializedHelices: function(){
        this.trigger(cadnanoEvents.partHelicesInitializedSignal);
        console.log('triggered helices done');
    },

    getRows: function(){
        return this.maxRow;
    },

    getCols: function(){
        return this.maxCol;
    },

    getOrigin: function() {
	return this.origin;
    },

    getRadius: function() {
	return this.radius;
    },

    getStorageID: function(row,col){
        return row*this.maxRowsEver+col;
    },

    getCoordFromStorageID: function(id){
        var rw = Math.floor(id/this.maxRowsEver);
        var cl = id%this.maxRowsEver;
        return {row:rw,col:cl};
    },

    getModelHelix: function(id){
        var coord = this.getCoordFromStorageID(id);
        if(typeof this.chosenHelixHash[coord.row] !== 'undefined') {
            return this.chosenHelixHash[coord.row][coord.col];
        }
        return null;
    },

    recycleHelixNumber: function(num){
        console.log('Trying to recycle number: ' + num);
        if(num % 2 === 0)
            this.evenRecycleBin.push(num);
        else
            this.oddRecycleBin.push(num);
    },

    createVirtualHelix: function(hrow,hcol){

var CreateVirtualHelixCommand = new Undo.Command.extend({
    constructor: function(part){
        console.log('CreateVirtualHelixCommand Constructor');
        this.modelPart = part;
        this.redo();
    },
    undo: function(){
        console.log('CreateVirtualHelixCommand undo');
        this.modelPart.recycleHelixNumber(this.modelHelix.hID);
        this.modelPart.removeVirtualHelix(this.modelHelix);
        //);
        
    },
    redo: function(){
        //Get row/column of helix that was clicked.
        console.log('CreateVirtualHelixCommand redo');
        var parityEven = this.modelPart.isEvenParity(hrow,hcol);
        var idNum = this.modelPart.reserveHelixIDNumber(parityEven);
        console.log('the helix number received is:' + idNum);
        var helix = new VirtualHelix({
            row:    hrow,
            col:    hcol,
            hID:    idNum,
            id:     this.modelPart.getStorageID(hrow,hcol),
            part:   this.modelPart,
            undoStack: this.modelPart.undoStack(),
        });
        //console.log(hrow + ',' + hcol + ',' + helix.hID + ',' + helix.row);

        //Add the VirtualHelix to a hash map in order
        //to retrieve it later.
        this.modelPart.addVirtualHelix(helix);

        //Also store a reference to the helix, in
        //order to undo if required.
        this.modelHelix = helix;

        //Send out the signals to PartItem in order to
        //update their views.
        this.modelPart.trigger(cadnanoEvents.partVirtualHelixAddedSignal, 
                helix
        );
        //this.trigger(cadnanoEvents.partActiveSliceResizeSignal, 
        //        helix
        //);
    },
    execute: function(){},
});
    this.undoStack().execute(new CreateVirtualHelixCommand(this));

    },

    generatorFullLattice: function(){
        var coords = Array();
        for(var i=0;i<this.maxRow;i++){
            for(var j=0;j<this.maxCol; j++){
                coords.push({row:i,col:j});
            }
        }
        return coords;
    },

    reserveHelixIDNumber: function(parityEven){
        //TODO: Have to implement a heap like in cadnano2.
        if(parityEven){
            if(this.evenRecycleBin.empty()){
                this.largestUnusedEvenNumber+=2;
                return this.largestUnusedEvenNumber;
            }
            else{
                return this.evenRecycleBin.pop();
            }
        }
        else{
            if(this.oddRecycleBin.empty()){
                this.largestUnusedOddNumber+=2;
                return this.largestUnusedOddNumber;
            }
            else{
                return this.oddRecycleBin.pop();
            }
        }
    },

    isHelixSelected: function(row,col){
        if(this.chosenHelixHash[row][col])
            return true;
        return false;
    },

    setStep: function(n){
	    if(n>0){
	        this.step = n;
	        this.trigger(cadnanoEvents.partStepSizeChangedSignal);
	    }
    },

    getStep: function(){
	    return this.step;
    },

    getStepSize: function(){
        return this.stepSize;
    },

    activeBaseIndex: function(){
        return this.activeIdx;
    },

    setActiveBaseIndex: function(idx){
        this.activeIdx = idx;
        this.trigger(cadnanoEvents.partActiveSliceResizedSignal);
    },

    setActiveVirtualHelix:
    function(modelHelix){
        this.activeHelix = modelHelix;
        this.trigger(cadnanoEvents.updatePreXoverItemsSignal,
                modelHelix);
    },

    /**
     * @param {neighborVirtualHelix} is a virtualHelix 
     * neighbor of the arg virtualHelix
     * @param {index} is the index where a potential Xover might occur
     * @param {strandType} is from the enum 
     * (StrandType.Scaffold, StrandType.Staple)
     * @param {isLowIdx} is whether or not it's 
     * the at the low index (left in the Pathview) of a potential Xover site
     * @return (neighborVirtualHelix, index, strandType, isLowIdx)
     */
    potentialCrossoverList:
    function(vh,idx){
        var lutsNeighbour = _.zip(this.scafL,this.scafH,this.stapL,this.stapH);
        var sts = new Array(Constants.Scaffold, Constants.Staple);

        var numBases = this.maxBaseIdx();
        var baseRange = _.range(0,numBases,this.stepSize);
        
        if (idx){
            baseRange = _.filter(baseRange, function(x){ if ((x >= idx - 3 * this.stepSize) && (x <= idx + 2 * this.stepSize)) return true;
                return false;
            });
        }
        var fromStrandSets = vh.getStrandSets();
        var neighbours = this.getVirtualHelixNeighbours(vh);

        var neighbourLutPair = _.zip(neighbours,lutsNeighbour);
        var ret = new Array();
        for(var i = 0; i < neighbourLutPair.length; i++){
            var neighbour = neighbourLutPair[i][0];
            if(typeof neighbour === 'undefined') 
                continue;

            var lutScaf = new Array(neighbourLutPair[i][1][0],neighbourLutPair[i][1][1]);
            var lutStap = new Array(neighbourLutPair[i][1][2],neighbourLutPair[i][1][3]);
            var lut = new Array(lutScaf, lutStap);

            var toSS = neighbour.getStrandSets();
            var fromSS = fromStrandSets;
            var quadruplet = _.zip(fromSS, toSS, lut, sts);
            for(var k=0; k < quadruplet.length; k++){
                var pts = _.zip(quadruplet[k][2],new Array(true, false));
                for(var j=0; j<pts.length;j++){
                    //Compute product of baseRange and pts.
                    for(var a=0;a<pts[j][0].length;a++){
                    for(var b=0;b<baseRange.length;b++){
                        var p = pts[j][0][a];
                        var q = baseRange[b];
                        var index = p+q;

                        var fromSet = quadruplet[k][0];
                        var toSet   = quadruplet[k][1];
                        var strandType = quadruplet[k][3];
                        var isLowIdx = pts[j][1];
                        
                        if(index < numBases){
                            if(fromSet.hasNoStrandAtOrNoXover(index) &&
                               toSet.hasNoStrandAtOrNoXover(index)){
                                ret.push(new Array(neighbour, index, strandType, isLowIdx)); 
                            }
                        }
                    }}
                }
            }
        }
        return ret;
    },

    maxBaseIdx:
    function(){
        return this.step * this.stepSize;
    },

    /**
     * pass in two strands, and their corresponding
     * indices, where the xover can be created.
     */
    createXover:
    function(strand5p, s5pIdx, strand3p, s3pIdx){
        /**
         * Two cases.
         * when both the strands are the same. - later.
         * When the two strands are different.
         *
         */
        var ss5p = strand5p.strandSet;
        var ss3p = strand3p.strandSet;

        //Create the xover at the 3' strand.
        //Check if the xover is at an endpoint.
        var split3pIdx = s3pIdx;
        if(ss3p.isDrawn5to3())
            split3pIdx = s3pIdx-1;
        if((s3pIdx === strand3p.idx5Prime()) ||
           (ss3p.canSplitStrand(strand3p,split3pIdx))
          ){
                console.log('Can do crossover due to strand3p');
        }
        else{
            console.log('Cannot split strand3p');
            return;
        }

        //Create the xover at the 5' strand.
        //Check if the xover is at an endpoint.
        var split5pIdx = s5pIdx;
        if(!ss5p.isDrawn5to3())
            split5pIdx = s5pIdx-1;
        if((s5pIdx === strand5p.idx3Prime()) || 
           (ss5p.canSplitStrand(strand5p,split3pIdx))
          ){
              console.log('Can do crossover due to strand3p');
        }
        else{
                console.log('Cannot split strand5p');
                return;
        }
        var ret5p,ret3p;
        var xover5p, xover3p;
        if(s5pIdx !== strand5p.idx3Prime()){
            ret5p = ss5p.splitStrand(strand5p, split5pIdx);
            if(strand5p.isDrawn5to3()) xover5p = ret5p[0];
            else xover5p = ret5p[1];
        }
        else xover5p = strand5p;
        if(s3pIdx !== strand3p.idx5Prime()){
            ret3p = ss3p.splitStrand(strand3p, split3pIdx);
            if(strand3p.isDrawn5to3()) xover3p = ret3p[1];
            else xover3p = ret3p[0];
        }
        else xover3p = strand3p;
        console.log(s5pIdx);
        console.log(s3pIdx);

        this.undoStack().execute(
                new CreateXoverCommand(
                    this,
                    xover5p,
                    s5pIdx,
                    xover3p,
                    s3pIdx
                    ));
    },

});

var CreateXoverCommand = Undo.Command.extend({
    constructor: function(part, strand5p, s5pIdx, strand3p, s3pIdx){
        this.part = part;
        this.s5p = strand5p;
        this.s3p = strand3p;
        this.redo();
    },

    getModel:
    function(){
        console.log('testing CreateXoverCommand');
    },

    undo:
    function(){
        this.getModel();
        this.s5p.setConnection3p(null);
        this.s3p.setConnection5p(null);
        this.part.setActiveVirtualHelix(this.s5p.helix);
        //order of triggering signals is important.
        this.s3p.trigger(cadnanoEvents.strandUpdateSignal);
        this.s5p.trigger(cadnanoEvents.strandUpdateSignal);
    },

    redo:
    function(){
        this.getModel();
        this.s5p.setConnection3p(this.s3p);
        this.s3p.setConnection5p(this.s5p);
        this.part.setActiveVirtualHelix(this.s5p.helix);
        //order of triggering signals is important.
        this.s3p.trigger(cadnanoEvents.strandUpdateSignal);
        this.s5p.trigger(cadnanoEvents.strandUpdateSignal);
    },

    execute: function(){},
});

var HoneyCombPart = Part.extend({
    subStepSize: this.step/3,

    init: function(){
        this.scafL = Crossovers.honeycombScafLow;
        this.scafH = Crossovers.honeycombScafHigh;
        this.stapL = Crossovers.honeycombStapLow;
        this.stapH = Crossovers.honeycombStapHigh;
    },

    crossSectionType: function(){
        return Constants.HONEYCOMB;
    },

    getVirtualHelixNeighbors: function(){
        return null;
    },

    latticeCoordToPositionXY: function(row,column){
        var radius = this.radius;
        var xpos = column * radius * this.root3;
        if(this.isOddParity(row,column)){
            ypos = row*radius*3 + radius;
        }
        else ypos = row*radius*3;
        return ({
            x:  this.origin+xpos,
            y:  this.origin+ypos
        }); 
    },

    dist: function(x1,y1,x2,y2) {
        return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    },

    latticePositionXYToCoord: function(xPos, yPos, zoomfactor){
	var r = this.radius;
	if(!zoomfactor) zoomfactor = 1.0;
	//TODO: Temp fix for panel.
	var panel = $("#sliceView")[0];
	/*
	  How this function works:
	  Row is easy to determine, but column is not because of the overalapping horizontal region.
	  The two circles closest to the given coords is found and their distance to the given coords is calculated.
	  Then we just take the circle with distance less than r (if it exists).
	*/
	var correctedX = (xPos-45+panel.scrollLeft)/zoomfactor;
	var correctedY = (yPos-54+panel.scrollTop)/zoomfactor;
	var xLeft = Math.floor((correctedX-this.origin)/(1.732*r));
	var xRight = Math.ceil((correctedX-this.origin)/(1.732*r));
	var y = Math.floor((correctedY-this.origin+r)/(3*r));
	
	//left circle
	var centerXL = 0;
	var centerYL = 0;
	var distL = 0;
	//if(xLeft >= 0) { //avoids the case when xLeft = -1 but xRight = 0
	var coordL = this.latticeCoordToPositionXY(y, xLeft, zoomfactor);
	centerXL = coordL.x;
	centerYL = coordL.y;
	distL = this.dist(
	    correctedX,
	    correctedY,
	    centerXL,
	    centerYL
	);
	//right circle
	var centerXR = 0;
	var centerYR = 0;
	var distR = 0;
	var coordR = this.latticeCoordToPositionXY(y, xRight, zoomfactor);
	centerXR = coordR.x;
	centerYR = coordR.y;
	distR = this.dist(
            correctedX,
	    correctedY,
	    centerXR,
	    centerYR
        );
	var coord = {
	    col: 0,
	    row: 0
	};
	if(distL <= r) { 
            //we do not need to compare distL to distR because they cannot both be <= r*zf (or else there should be circle overlap)
            coord.col = xLeft;
            coord.row = y;
	}
	else if(distR <= r) {
            coord.col = xRight;
            coord.row = y;
	}
	else {
            coord.col = -1;
            coord.row = -1;
	}
	if(coord.col >= this.getCols() || coord.row >= this.getRows()) {
            coord.col = -1;
            coord.row = -1;
	}
	/*
	  else { //square mode - this part of search function is rather straightforward
	  var x = Math.floor((xPos-45-r*zoomfactor+panel.scrollLeft)/(2*r*zoomfactor));
	  var y = Math.floor((yPos-54-r*zoomfactor+panel.scrollTop)/(2*r*zoomfactor));
	  if(x < 0 || x >= gridWidth || y < 0 || y>= gridHeight) { //outside array boundary, return [-1,-1]
	  result[0] = -1;
	  result[1] = -1;
		return result;
		}
		var centerX = circleCenters[x][y][0]*zoomfactor;
		var centerY = circleCenters[x][y][1]*zoomfactor;
	    if(dist(xPos-45+panel.scrollLeft,yPos-54+panel.scrollTop,centerX,centerY) <= r*zoomfactor) {
	    result[0] = x;
	    result[1] = y;
	    }
	    else {
	    result[0] = -1;
	    result[1] = -1;
	    }
	    }
	*/
	return coord;
    },

    positionToCoord: function(row,column,scaleFactor){
        return null;
    },
    isOddParity: function(row,col){
        return (row+col)%2;
    },
    isEvenParity: function(row,col){
        return !((row+col)%2);
    },

    /**
     * The order in which the virtual helix neighbours
     * are returned is important to the functioning of
     * part.potentialCrossOverList.
     */
    getVirtualHelixNeighbours: function(vh){
        var ret = [];
        var helix;
        var emptyObj;
        if(!vh) return ret;
        var r = vh.row;
        var c = vh.col;

        if(vh.isEvenParity()){
            helix = (this.getModelHelix(this.getStorageID(r,c+1)));
            if(helix) ret.push(helix);
            else ret.push(emptyObj);

            helix = (this.getModelHelix(this.getStorageID(r-1,c)));
            if(helix) ret.push(helix);
            else ret.push(emptyObj);

            helix = (this.getModelHelix(this.getStorageID(r,c-1)));
            if(helix) ret.push(helix);
            else ret.push(emptyObj);
        }
        else{
            helix = (this.getModelHelix(this.getStorageID(r,c-1)));
            if(helix) ret.push(helix);
            else ret.push(emptyObj);

            helix = (this.getModelHelix(this.getStorageID(r+1,c)));
            if(helix) ret.push(helix);
            else ret.push(emptyObj);

            helix = (this.getModelHelix(this.getStorageID(r,c+1)));
            if(helix) ret.push(helix);
            else ret.push(emptyObj);
        }
        return ret;
    },
});

var SquarePart = Part.extend({
    subStepSize: this.step/4,

    init: function(){
        this.scafL = Crossovers.squareScafLow;
        this.scafH = Crossovers.squareScafHigh;
        this.stapL = Crossovers.squareStapLow;
        this.stapH = Crossovers.squareStapHigh;
    },

    crossSectionType: function(){
        return Constants.SQUARE;
    },

    getVirtualHelixNeighbours: function(){
        return null;
    },

    latticeCoordToPositionXY: function(row,column,scaleFactor){
        return null;
    },

    positionToCoord: function(row,column,scaleFactor){
        return null;
    },

});
