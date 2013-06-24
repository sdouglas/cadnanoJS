function Part(ModelDoc){
    var me = this;
    me.currDoc = ModelDoc;
    /*
    this.currEvenHelix_ = -2; //Helix Numbering
    this.currOddHelix_ = -1; //Helix Numbering
    this.part_ = {}; //Stores all the virtual helix items.
    this.circles_ = []; //Stores the virtual helix polygons.

    //Blindly copied over from cadnano2.
    this._step = 21;
    this._radius = 1.125; //nanometres
    this._turnsPerStep = 2;
    this._helicalPitch = this._step/this._turnsPerStep;
    this._twistPerBase = 360/this._helicalPitch;
    */
}

/*
Part.prototype.getHelix = function(id){
    return this.part_[id];
};

Part.prototype.setHelix = function(key, helix){
    if(key){
        this.part_[key] = helix;
    }
};

Part.prototype.getHelices = function(){
    return this.circles_;
};

Part.prototype.addHelix = function(polygon){
    if(polygon){
        this.circles_.push(polygon);
    }
};

Part.prototype.getNextEvenHelixID = function(id){
    this.currEvenHelix_+=2;
    return this.currEvenHelix_;
};

Part.prototype.getNextOddHelixID = function(id){
    this.currOddHelix_+=2;
    return this.currOddHelix_;
};

*/
//////////////////////////////////////////////////////////////////

function HoneyCombPart(){
    console.log("creating new honeycomb part");
    //this.LatticeType_ = Constants.HONEYCOMB; //HoneyComb
}

function SquarePart(){
    console.log("creating new square part");
    //this.LatticeType_ = Constants.SQUARE;
}


