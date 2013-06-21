if(typeof Object.create !== 'function'){
    Object.create = function(obj){
        var tmpObj = function(){};
        tmpObj.prototype = obj.prototype;
        return new tmpObj();
    };
}

function viewHandler(type){
    if(type === Constants.RendererTwo){
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
        polygon.fill = this.defaultFill;
        polygon.stroke = this.defaultStroke;
        polygon.linewidth = this.defaultWidth;
    }

    this.init = function(){
        this.handler = new Two();
        this.defaultFill = '#D4D4D4';
        this.defaultStroke = 'black';
        this.defaultLineWidth = 1;
    }

    this.setParams = function(params){
    };

    this.addTo = function(el){
        this.handler.appendTo(el);
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
