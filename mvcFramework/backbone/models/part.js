var Part = Backbone.Model.extend({
    step: 21,
    radius: 1.125,
    turnsPerStep:2,
    helicalPitch: this.step/this.turnsPerStep,
    twistPerBase: 360/this.helicalPitch,
    maxRow: 10,
    maxCol: 10,
    root3: 1.732051,
    largestUnusedOddNumber: -1,
    largestUnusedEvenNumber: -2,

    initialize: function(){
        console.log("added a new part");
    },
    
    setDoc: function(doc){
        this.currDoc = doc;
    },
    
    createVirtualHelix: function(){
        //Get row/column of helix that was clicked.
        var parityEven = this.isEvenParity(row,col);
        var idNum = this.reserveHelixIDNumber(parityEven);
        var helix = new VirtualHelix({
            row:    hrow,
            col:    hcol,
            id:     idNum
        });

        this.trigger(cadnanoEvents.partVirtualHelixAddedSignal);
        this.trigger(cadnanoEvents.partActiveSliceResizeSignal);
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
        return ({x:scaleFactor*xpos,y:scaleFactor*ypos}); 
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
