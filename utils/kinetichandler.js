function viewHandlerKinetic(){
    this.clearLayers = function(){
        this.helixLayer.removeChildren();
        this.textLayer.removeChildren();
    }

    this.createCircle = function(centerX,centerY,r, params, helixNum){
        this.x = centerX;
        this.y = centerY;
        this.r = r;
        var fill = params.fill?params.fill:colours.grayfill;
        var stroke=params.stroke?params.stroke:colours.graystroke;
        var strokewidth=params.strokewidth?params.strokewidth:colours.strokewidth;
        var whichlayer = params.layer?params.layer:Constants.defaultLayer;

	    var circle = new Kinetic.Circle({
		    radius:     r,
		    x:          centerX,
		    y:          centerY,
            fill:       fill,
            stroke:     stroke,
            strokeWidth:strokewidth,
	    });
        if(whichlayer === Constants.defaultLayer){
            this.shapeLayer.add(circle);
            //circle.setZIndex(Constants.zlow);
        }
        else if (whichlayer === Constants.helixLayer){
            //circle.setZIndex(Constants.zmid);
            this.helixLayer.add(circle);
        }
        if(typeof helixNum !== 'undefined'){
            this.addTextToCircle(helixNum);
        }
        this.shapeLayer.draw();
        this.helixLayer.draw();
        this.textLayer.draw();
        return circle;
    }

    this.init = function(){
        this.textLayer = new Kinetic.Layer();
        this.shapeLayer = new Kinetic.Layer();
        this.helixLayer = new Kinetic.Layer();
        this.hoverLayer = new Kinetic.Layer();
    }

    this.setParams = function(params){
        this.handler = new Kinetic.Stage(params);
        this.handler.add(this.shapeLayer);
        this.handler.add(this.hoverLayer);
        this.handler.add(this.textLayer);
        this.handler.add(this.helixLayer);

        this.shapeLayer.setZIndex(Constants.zlow);
        this.helixLayer.setZIndex(Constants.zmid);
        this.hoverLayer.setZIndex(Constants.zhigh);
        this.textLayer.setZIndex(Constants.zhighest);

    };

    this.addToDom = function(el){
        return true;
    };

    this.render = function(){
        console.log("kinetichandler render");
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
        //helixNumText.setZIndex(Constants.zhigh);
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
        this.helixLayer.destroy();
        this.shapeLayer.destroy();
        this.hoverLayer.destroy();
        this.textLayer.destroy();
        this.handler.clear();
        delete this;
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
        //circle.setZIndex(Constants.zhighest);
        this.hoverLayer.removeChildren();
        this.hoverLayer.add(circle);
        this.hoverLayer.draw();
        return circle;
    }

    this.init();
};
