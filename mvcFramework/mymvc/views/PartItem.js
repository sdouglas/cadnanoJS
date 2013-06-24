function PartItem(ModelPart,params){
    /*
    this.LatticeType_ = 0; //HoneyComb
    this.currEvenHelix_ = -2; //Helix Numbering
    this.currOddHelix_ = -1; //Helix Numbering
    this.part_ = {}; //Stores all the virtual helix items.
    this.circles_ = []; //Stores the virtual helix polygons.
    */
    var me = this;
    /*
    this.test = function(){
        //figuring out what proto is.
        function Planet(name){
            this.name = name;
        }
        var earth = new Planet('earth');


        function mars(){
        }
        mars.prototype = new Planet('mars');
        //mars.prototype = Planet.prototype;
        var mars1 = new mars();
        console.log(mars1.toString());
        console.log(earth.__proto__);
        console.log(Planet.prototype);
        console.log(mars1.__proto__);
        console.log(mars.prototype);
        console.log(mars.toString());
    };
    this.test();
    */
    console.log('hi');
    console.log(ModelPart);
    console.log(params);
    console.log('h2');
    //createViewHandler
    this.createViewHandler = function(params,who){
        var viewer;
        if(who === Constants.RendererTwo){
            viewer = new Two(params);
        }
        else if (who === Constants.RendererThree){
            console.log("three.js not supported yet");
            viewer = undefined;
            //hmm
        }
        else { //default
            console.log("need to supply a proper renderer.");
            viewer = undefined;
        }
        return viewer;
    };
    console.log("creating a partitem object");
    me.part = ModelPart;
    //me.partItemController = new ViewRootController(me.part,me);
    this.viewHandler = this.createViewHandler(params, Constants.RendererTwo);
}

/*
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

*/

function SlicePartItem(ModelPart, params){
    var me = this;
    console.log(ModelPart);
    PartItem.call(ModelPart,params);
    this.documentPartAddedSlot = function(){
        console.log("got the slicepartitem signal dudettes");
    };

    this.createHoneyComb = function(twoHandler){

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
                console.log(twoHandler);
                helix.make(twoHandler,x_curr,y_curr,radius);
//                twoHandler.add(helix.getPolygon());
//                var k = 'two-' + helix.getSvgID();
//                this.setHelix(k, helix);

//                x_curr += 1.732*radius;
//                this.addHelix(helix.getPolygon());
            }
        }
    };


    console.log(this.viewHandler);
    this.createHoneyComb(this.viewHandler);
}


function PathPartItem(ModelPart, params){
    PartItem.call(ModelPart,params);

    //var me = this;
    me.documentPartAddedSlot = function(){
        console.log("got the pathpartitem signal dudettes");
    };
}
