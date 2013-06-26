if(typeof Object.create !== 'function'){
    Object.create = function(obj){
        var tmpObj = function(){};
        tmpObj.prototype = obj.prototype;
        return new tmpObj();
    };
}

function jsClass(){
    var that = this;
}

function viewHandler(type){
    if(type === Constants.RendererTwo){
        console.log(type);
        return new viewHandlerTwo();
    }
    else if (type === Constants.RendererThree){
        return new viewHandlerThree();
    }
    else{
        console.log("Incorrect handler specified");
        return null;
    }
};

function viewHandlerTwo(){
    this.createCircle = function(x,y,radius){
        var polygon = this.handler.makeCircle(x,y,radius);
        console.log(polygon);
        polygon.fill = this.defaultFill;
        polygon.stroke = this.defaultStroke;
        polygon.linewidth = this.defaultLineWidth;
    }

    this.init = function(){
        console.log('in function init of handler');
        this.handler = new Two();
        this.defaultFill = '#F2AA77';
        this.defaultStroke = 'black';
        this.defaultLineWidth = 1;
    }

    this.setParams = function(params){
        this.handler.width = params.width;
        this.handler.height = params.height;
        this.handler.type = params.type;
    };

    this.addTo = function(el){
        console.log(el);
        this.handler.appendTo(el);
    };

    this.render = function(){
        console.log("calling two update");
        this.handler.update();
    };

    this.init();
};

function viewHandlerThree(){
    this.createCircle = function(x,y,radius){
    };
    
    this.init = function(){
    };
    this.init();
};
