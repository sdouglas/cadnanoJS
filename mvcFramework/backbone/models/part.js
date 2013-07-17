var Part = Backbone.Model.extend({
    step: 2,
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
    },

    getVHSet: function(){
        return this.virtualHelixSet;
    },
    
    setDoc: function(doc){
        this.currDoc = doc;
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
       //this.trigger(cadnanoEvents.partActiveSliceResizeSignal, 
       //  helix);
    },
    
    initializedHelices: function(){
        this.trigger(cadnanoEvents.partHelicesInitializedSignal);
        console.log('triggered helices done');
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

    activeBaseIndex: function(){
        return this.activeIdx;
    },

    setActiveBaseIndex: function(idx){
        this.activeIdx = idx;
        this.trigger(cadnanoEvents.partActiveSliceResizedSignal);
    },
});

var HoneyCombPart = Part.extend({
    subStepSize: this.step/3,
    crossSectionType: function(){
        return Constants.HONEYCOMB;
    },

    getVirtualHelixNeighbours: function(){
        return null;
    },

    latticeCoordToPositionXY: function(row,column,scaleFactor){
        if(!scaleFactor) scaleFactor = 1.0;

        var radius = this.radius;
        var xpos = column * radius * this.root3;
        if(this.isOddParity(row,column)){
            ypos = row*radius*3 + radius;
        }
        else ypos = row*radius*3;
        return ({
            x:  this.origin+scaleFactor*xpos,
            y:  this.origin+scaleFactor*ypos
        }); 
    },

    dist: function(x1,y1,x2,y2) {
        return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    },

    latticePositionXYToCoord: function(xPos, yPos, zoomfactor){
    var r = this.radius;
    if(!zoomfactor) zoomfactor = 1.0;
    //TODO: Temp fix for panel.
    var panel = {scrollLeft: 0, scrollTop: 0};
    /*
      How this function works:
      Row is easy to determine, but column is not because of the overalapping horizontal region.
      The two circles closest to the given coords is found and their distance to the given coords is calculated.
      Then we just take the circle with distance less than r (if it exists).
    */
	    var xLeft = Math.floor((xPos-this.origin-45+panel.scrollLeft)/(1.732*r*zoomfactor));
	    var xRight = Math.ceil((xPos-this.origin-45+panel.scrollLeft)/(1.732*r*zoomfactor));
	    var y = Math.floor((yPos-this.origin-54+panel.scrollTop+r*zoomfactor)/(3*r*zoomfactor));

	    //left circle
	    var centerXL = 0;
	    var centerYL = 0;
	    var distL = 0;
	    //if(xLeft >= 0) { //avoids the case when xLeft = -1 but xRight = 0
            var coordL = this.latticeCoordToPositionXY(y, xLeft, zoomfactor);
            centerXL = coordL.x;
            centerYL = coordL.y;
	    distL = this.dist(
                xPos-45+panel.scrollLeft,
		yPos-54+panel.scrollTop,
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
                xPos-45+panel.scrollLeft,
		yPos-54+panel.scrollTop,
		centerXR,
		centerYR
            );
    var coord = {
	col: 0,
	row: 0
    };
	    if(distL <= r*zoomfactor) { 
            //we do not need to compare distL to distR because they cannot both be <= r*zf (or else there should be circle overlap)
            coord.col = xLeft;
            coord.row = y;
	    }
	    else if(distR <= r*zoomfactor) {
            coord.col = xRight;
            coord.row = y;
	    }
	    else {
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
});

var SquarePart = Part.extend({
    subStepSize: this.step/4,
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
