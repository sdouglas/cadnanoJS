function viewHandlerKinetic(){
    this.createCircle = function(x,y,radius){
        var polygon = this.handler.makeCircle(x,y,radius);
        polygon.fill = this.defaultFill;
        polygon.stroke = this.defaultStroke;
        polygon.linewidth = this.defaultLineWidth;
        console.log(polygon);
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

    this.addToDom = function(el){
        console.log(el);
        this.handler.appendTo(el);
    };

    this.render = function(){
        console.log("calling two update");
        this.handler.update();
    };

    this.init();
};
