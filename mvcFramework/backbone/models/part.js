var Part = Backbone.Model.extend({
    step: 21,
    //TODO: what is this used for in cadnano2?
    //radius: 1.125,
    radius: 20,
    turnsPerStep:2,
    helicalPitch: this.step/this.turnsPerStep,
    twistPerBase: 360/this.helicalPitch,
    maxRow: 50,
    maxCol: 50,
    root3: 1.732051,
    largestUnusedOddNumber: -1,
    largestUnusedEvenNumber: -2,
    origin:  50,                    //In order to shift away from the origin.

    initialize: function(){
        console.log("added a new part");
        this.chosenHelixHash = new Array();
        this.virtualHelixSet = new VirtualHelixSet();
    },
    
    setDoc: function(doc){
        this.currDoc = doc;
    },

    addVirtualHelix: function(helix){
        if(!this.chosenHelixHash[helix.getRow()]){
            this.chosenHelixHash[helix.getRow()] = new Array();
        }
        this.chosenHelixHash[helix.getRow()][helix.getCol()] = helix;
        //Add to the backbone collection.
        this.virtualHelixSet.add(helix);
    },
    
    initializedHelices: function(){
        this.trigger(cadnanoEvents.partHelicesInitializedSignal);
        console.log('triggered helices done');
    },

    createVirtualHelix: function(hrow,hcol){
        //Get row/column of helix that was clicked.
        var parityEven = this.isEvenParity(hrow,hcol);
        var idNum = this.reserveHelixIDNumber(parityEven);
        var helix = new VirtualHelix({
            row:    hrow,
            col:    hcol,
            id:     idNum,
            part:   this,
        });
        console.log(hrow + ',' + hcol);

        //Add the VirtualHelix to a hash map in order
        //to retrieve it later.
        this.addVirtualHelix(helix);

        //Send out the signals to PartItem in order to
        //update their views.
        //this.trigger(cadnanoEvents.partVirtualHelixAddedSignal, 
        //        helix
        //);
        //this.trigger(cadnanoEvents.partActiveSliceResizeSignal, 
        //        helix
        //);
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
            this.largestUnusedEvenNumber+=2;
            return this.largestUnusedEvenNumber;
        }
        else{
            this.largestUnusedOddNumber+=2;
            return this.largestUnusedOddNumber;
        }
    },

    isHelixSelected: function(row,col){
        if(this.chosenHelixHash[row][col])
            return true;
        return false;
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

    positionToCoord: function(row,column,scaleFactor){
        return null;
    },
    isOddParity: function(row,col){
        return (row+col)%2;
    },
    isEvenParity: function(row,col){
        return !(row+col)%2;
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
