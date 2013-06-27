function viewHandlerKinetic(){
    this.createCircle = function(centerX,centerY,r){
        this.x = centerX;
        this.y = centerY;
        this.r = r;

	    var circle = new Kinetic.Circle({
		    radius:     r,
		    x:          centerX,
		    y:          centerY,
            fill:       '#F2AA77',
            stroke:     '#000000',
            strokeWidth:1,
		    //fill:       this.defaultFill,
		    //stroke:     this.defaultStroke,
		    //strokeWidth: this.defaultLineWidth,
	    });
        this.shapeLayer.add(circle);
        this.shapeLayer.draw();
        console.log('creating circle');
    }

    this.init = function(){
        console.log('in function init of handler');
        this.textLayer = new Kinetic.Layer();
        this.shapeLayer = new Kinetic.Layer();

        this.defaultFill = '#F2AA77';
        this.defaultStroke = 'black';
        this.defaultLineWidth = 1;
    }

    this.setParams = function(params){
        console.log('setting up the stage');
        this.handler = new Kinetic.Stage(params);
    };

    this.addToDom = function(el){
        return true;
    };

    this.render = function(){
        console.log("calling kinetic update");
        this.handler.add(this.shapeLayer);
        this.handler.add(this.textLayer);
        this.shapeLayer.draw();
        this.textLayer.draw();
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

    this.init();
};
