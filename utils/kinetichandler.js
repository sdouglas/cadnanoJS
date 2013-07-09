function viewHandlerKinetic(){
    this.createCircle = function(centerX,centerY,r, params){
        this.x = centerX;
        this.y = centerY;
        this.r = r;
        var fill = params.fill?params.fill:colours.grayfill;
        var stroke=params.stroke?params.stroke:colours.graystroke;
        var strokewidth=params.strokewidth?params.strokewidth:colours.strokewidth;

	    var circle = new Kinetic.Circle({
		    radius:     r,
		    x:          centerX,
		    y:          centerY,
            fill:       fill,
            stroke:     stroke,
            strokeWidth:strokewidth,
	    });
        this.shapeLayer.add(circle);
        return circle;
    }

    this.init = function(){
        console.log('in function init of handler');
        this.textLayer = new Kinetic.Layer();
        this.shapeLayer = new Kinetic.Layer();
    }

    this.setParams = function(params){
        console.log('setting up the stage');
        console.log(params);
        console.log(this);
        this.handler = new Kinetic.Stage(params);
    };

    this.addToDom = function(el){
        return true;
    };

    this.render = function(){
        console.log("calling kinetic update");
        this.handler.add(this.shapeLayer);
        this.handler.add(this.textLayer);
    };

    this.getX = function(){
        return this.x;
    };

    this.getY = function(){
        return this.y;
    };

    this.getR = function(){
        return this.r;
    };

    this.addTextToCircle = function(helixNum){
        this.setFill(activeFill);
        //number on the circle
        var textX;
        if(helixNum < 10) {textX = this.getX()-this.getR()/4;}
        else if(helixNum < 100) {textX = this.getX()-this.getR()/2;}
        else {textX = this.getX()-this.getR()*3/4;}
        var textY = this.getY()-r/2;
        var helixNumText = new Kinetic.Text({
            x: textX,
            y: textY,
            text: helixNum,
            fontSize: 12,
            fontFamily: "Calibri",
            fill: "#000000",
            align: "CENTER"
        });
        //end: number on the circle
        textLayer.add(helixNumText);
    };

    this.remove = function(){
        this.shapeLayer.destroy();
        this.textLayer.destroy();
        this.handler.clear();
    }

    this.init();
};
