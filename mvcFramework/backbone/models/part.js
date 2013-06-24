var Part = Backbone.Model.extend({
    step: 21,
    radius: 1.125,
    turnsPerStep:2,
    helicalPitch: this.step/this.turnsPerStep,
    twistPerBase: 360/this.helicalPitch,
    maxRow: 10,
    maxCol: 10,
    root3: 1.732051,

    initialize: function(doc){
        this.currDoc = doc;
        console.log("added a new part");
    },
    
    currDoc: function(){
        return this.currDoc;
    },
    
    addVirtualHelix: function(){
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
        if(this.isOddPolarity(row,column)){
            ypos = row*radius*3 + radius;
        }
        else ypos = row*radius*3;
        return ({x:scaleFactor*xpos,y:scaleFactor*ypos}); 
    },

    positionToCoord: function(row,column,scaleFactor){
        return null;
    },
    isOddPolarity: function(row,col){
        return true;
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
