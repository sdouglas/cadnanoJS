function EndpointItem(vhi, baseX, baseY, type) { //type can only be 3 or 5
    this.helixitem = vhi;
/*
    var helixset = vhi.helixset;
    function getBaseX(posx) {
	var blockLen = vhis.divLength*vhis.sqLength+2;
	//these 2 lines only work with current cadnano3.html panel layout but divs can be renamed                                                                                                                         
	var blockNum = Math.floor(posx/blockLen);
	var tempCounter = Math.floor((posx-blockNum*blockLen)/vhis.sqLength)+blockNum*vhis.divLength;
	return Math.min(Math.max(0,tempCounter),vhis.grLength-1);
    }
*/
    this.layer = new Kinetic.Layer();
    this.centerX = vhi.startX+(baseX+0.5)*vhi.sqLength+2*Math.floor(baseX/vhi.helixset.divLength);
    this.centerY = vhi.startY+(baseY+0.5)*vhi.sqLength;
    this.endtype = type;
    this.parity = vhi.num%2; //EPI looks different depending on VHI's number
    if(type === 3) { //3' end: triangle
	this.shape = new Kinetic.Polygon({
		points: [this.centerX-(2*this.parity-1)*vhi.sqLength*0.3,this.centerY,
			 this.centerX+(2*this.parity-1)*vhi.sqLength*0.5,this.centerY-vhi.sqLength*0.5,
			 this.centerX+(2*this.parity-1)*vhi.sqLength*0.5,this.centerY+vhi.sqLength*0.5],
		fill: "#FF0000",
		stroke: "#000000",
		strokeWidth: 1,
		draggable: true,
		/*
		dragBoundFunc: function(pos) {
		    return {
			x: getBaseX(pos.x)*helixset.sqLength+2*Math.floor(getBaseX(pos.x)/helixset.divLength),
			y: this.getAbsolutePosition().y
		    }
		}
		*/
	    });
    }
    else if(type === 5) { //5' end: square
	this.shape = new Kinetic.Rect({
		draggable: true,
		x: this.centerX-vhi.sqLength*0.2-vhi.sqLength*this.parity*0.3,
		y: this.centerY-vhi.sqLength*0.35,
		width: vhi.sqLength*0.7,
		height: vhi.sqLength*0.7,
		fill: "#FF0000",
		stroke: "#000000",
		strokeWidth: 1
	    });
    }
    else {
	alert(type+"\' end does not exist!");
	throw "stop execution";
    }
    this.layer.add(this.shape);
    vhi.canvas.add(this.layer);
    this.layer.draw();
}

function StrandItem(epi1, epi2) { //must have 2 EPIs to create a strand
    if(epi1.endtype + epi2.endtype != 8) {
	alert("A strand's endpoints must be a 3\' and a 5\'!");
	throw "stop execution";
    }
    if(epi1.helixitem != epi2.helixitem) {
	alert("Two endpoints must be on the same helix!");
	throw "stop execution";
    }
    this.layer = epi1.helixitem.helixset.slayer;
    this.connection = new Kinetic.Line({
	    points: [epi1.centerX, epi1.centerY, epi2.centerX, epi2.centerY],
	    stroke: "#FF0000",
	    strokeWidth: 3
	});
    this.group = new Kinetic.Group();
    this.group.add(this.connection);
    epi1.shape.moveTo(this.group);
    epi1.layer.remove();
    epi2.shape.moveTo(this.group);
    epi2.layer.remove();
    this.layer.add(this.group);
    this.layer.moveToTop();
    this.layer.draw();
}