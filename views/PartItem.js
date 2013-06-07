function PartItem(){
    this.LatticeType_ = 0; //HoneyComb
    this.currEvenHelix_ = -2; //Helix Numbering
    this.currOddHelix_ = -1; //Helix Numbering
    this.part_ = {}; //Stores all the virtual helix items.
    this.circles_ = []; //Stores the virtual helix polygons.
}

PartItem.prototype.getHelix = function(id){
    return this.part_[id];
};

PartItem.prototype.setHelix = function(key, helix){
    if(key){
        this.part_[key] = helix;
    }
};

PartItem.prototype.getHelices = function(){
    return this.circles_;
};

PartItem.prototype.addHelix = function(polygon){
    if(polygon){
        this.circles_.push(polygon);
    }
};

PartItem.prototype.getNextEvenHelixID = function(id){
    this.currEvenHelix_+=2;
    return this.currEvenHelix_;
};

PartItem.prototype.getNextOddHelixID = function(id){
    this.currOddHelix_+=2;
    return this.currOddHelix_;
};

PartItem.prototype.createHoneyComb = function(twoHandler){

    // two has convenience methods to create shapes.
    var radius = 20;
    var x_init = 60;
    var y_even_init = 60;
    var y_odd_init = y_even_init + 4*radius;
    var Rows = 10;
    var Cols = 10;
    for(var row = 0; row<Rows; row++){
        x_curr = x_init;
        if(row % 2 === 0){
            y_even = y_even_init + 6*radius*(row/2);
            y_odd = y_even + radius;
        }
        else{
            y_even = y_odd_init + 6*radius*((row-1)/2);
            y_odd = y_even - radius;
        }

        for(var col = 0; col<Cols; col++){
            if(col % 2 === 0){
                y_curr = y_even;
            }
            else {
                y_curr = y_odd;
            }

            var helix = new VirtualHelixItem(row,col);
            helix.make(twoHandler,x_curr,y_curr,radius);
            twoHandler.add(helix.getPolygon());
            var k = 'two-' + helix.getSvgID();
            this.setHelix(k, helix);

            x_curr += 1.732*radius;
            this.addHelix(helix.getPolygon());
        }
    }
};
//////////////////////////////////////////////////////////////////
