function viewHandlerKinetic(){
    this.createCircle = function(centerX,centerY,r, params, helixNum){
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
        if(typeof helixNum !== 'undefined'){
            console.log(helixNum);
            this.addTextToCircle(helixNum);
        }
        this.shapeLayer.draw();
        this.textLayer.draw();
        return circle;
    }

    this.init = function(){
        console.log('in function init of handler');
        this.textLayer = new Kinetic.Layer();
        this.shapeLayer = new Kinetic.Layer();
        this.hoverLayer = new Kinetic.Layer();
    }

    this.setParams = function(params){
        console.log('setting up the stage');
        console.log(params);
        console.log(this);
        this.handler = new Kinetic.Stage(params);
        this.handler.add(this.shapeLayer);
        this.handler.add(this.hoverLayer);
        this.handler.add(this.textLayer);
    };

    this.addToDom = function(el){
        return true;
    };

    this.render = function(){
        console.log("calling kinetic update");
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

    /*
    this.addTextToCircle = function(helixNum){
        //number on the circle
        var textX;
        if(helixNum < 10) {textX = this.getX()-this.getR()/4;}
        else if(helixNum < 100) {textX = this.getX()-this.getR()/2;}
        else {textX = this.getX()-this.getR()*3/4;}
        var textY = this.getY()-this.getR()/2;
        console.log(textX + '.' + textY + '.' + helixNum);
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
        this.textLayer.add(helixNumText);
    };
    */

    this.addTextToCircle = function(helixNum, layer){
	var myLayer = layer;
	if(typeof layer === "undefined") {
	    myLayer = this.textLayer;
	}
        //number on the circle
        var textX;
        if(helixNum < 10) {textX = this.getX()-this.getR()/4;}
        else if(helixNum < 100) {textX = this.getX()-this.getR()/2;}
        else {textX = this.getX()-this.getR()*3/4;}
        var textY = this.getY()-this.getR()/2;
        console.log(textX + '.' + textY + '.' + helixNum);
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
        myLayer.add(helixNumText);
    };

    this.remove = function(){
        this.shapeLayer.destroy();
        this.hoverLayer.destroy();
        this.textLayer.destroy();
        this.handler.clear();
    }

    this.addHover = function(centerX,centerY,r,params){
        var fill = params.fill?params.fill:colours.bluefill;
        var stroke=params.stroke?params.stroke:colours.bluestroke;
        var strokewidth=params.strokewidth?params.strokewidth:colours.hoverstrokewidth;

	    var circle = new Kinetic.Circle({
		    radius:     r,
		    x:          centerX,
		    y:          centerY,
            fill:       fill,
            stroke:     stroke,
            strokeWidth:strokewidth,
	    });
        this.hoverLayer.removeChildren();
        this.hoverLayer.add(circle);
        this.hoverLayer.draw();
        return circle;
    }

    this.init();
};
