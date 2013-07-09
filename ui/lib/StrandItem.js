function UI_EndpointItem(vhi, baseX, baseY, type) { //type can only be 3 or 5
    this.strand = undefined;
    this.helixitem = vhi;
    var self = this;
    var vhis = vhi.helixset;
    var initcounter = baseX;
    this.counter = initcounter;
    this.layer = new Kinetic.Layer();
    this.centerX = vhi.startX+(baseX+0.5)*vhi.sqLength+2*Math.floor(baseX/vhi.helixset.divLength);
    this.centerY = vhi.startY+(baseY+0.5)*vhi.sqLength;
    this.endtype = type;
    this.parity = vhi.num%2; //EPI looks different depending on VHI's number
    var polypts;
    if(type === 3) { //3' end: triangle
	polypts = [this.centerX-(2*this.parity-1)*vhi.sqLength*0.3,this.centerY,
		   this.centerX+(2*this.parity-1)*vhi.sqLength*0.5,this.centerY-vhi.sqLength*0.5,
		   this.centerX+(2*this.parity-1)*vhi.sqLength*0.5,this.centerY+vhi.sqLength*0.5];
    }
    else if(type === 5) { //5' end: square
	//reason I didn't use Kinetic.Rect: its getX function works differently and shows the shape at wrong position
	polypts = [this.centerX-vhi.sqLength*0.2-vhi.sqLength*this.parity*0.3,this.centerY-vhi.sqLength*0.35,
		   this.centerX-vhi.sqLength*0.2-vhi.sqLength*this.parity*0.3,this.centerY+vhi.sqLength*0.35,
		   this.centerX+vhi.sqLength*0.5-vhi.sqLength*this.parity*0.3,this.centerY+vhi.sqLength*0.35,
		   this.centerX+vhi.sqLength*0.5-vhi.sqLength*this.parity*0.3,this.centerY-vhi.sqLength*0.35];
    }
    else { //typo
	alert(type+"\' end does not exist!");
	throw "stop execution";
    }
    this.shape = new Kinetic.Polygon({
	    points: polypts,
	    fill: "#FF0000",
	    stroke: "#000000",
	    strokeWidth: 1,
	    draggable: true,
	    //copy pasta from PathSlidebarItem in PathPanelItem.js
	    dragBoundFunc: function(pos) {
		return {
		    x: (this.epi.counter-initcounter)*vhis.sqLength+2*Math.floor(this.epi.counter/vhis.divLength)-2*Math.floor(initcounter/vhis.divLength),
		    y: this.getAbsolutePosition().y
		}
	    }
	});
    this.shape.epi = this; //javascript y u no have pointers?!
    //more copy pasta from slidebar
    this.shape.on("dragmove", function(pos) {
            var blockLen = vhis.divLength*vhis.sqLength+2;
            var blockNum = Math.floor((pos.x-51-innerLayout.state.west.innerWidth+document.getElementById(vhis.pathpanel.domele).scrollLeft-vhis.startX)/blockLen);
            var tempCounter = Math.floor((pos.x-51-innerLayout.state.west.innerWidth+document.getElementById(vhis.pathpanel.domele).scrollLeft-blockNum*blockLen-vhis.startX)/vhis.sqLength)+blockNum*vhis.divLength;
	    if((this.epi.endtype === 3 && this.epi.parity === 0)||(this.epi.endtype === 5 && this.epi.parity === 1)) {
		this.epi.counter = Math.min(Math.max(this.epi.strand.endptL.counter+1,tempCounter),vhis.grLength-1);
	    }
	    else {
		this.epi.counter = Math.min(Math.max(0,tempCounter),this.epi.strand.endptR.counter-1);
	    }
        });
    //when drag ends, update stats and redraw connection
    this.shape.on("dragend", function(pos) {
	    this.epi.centerX = vhi.startX+(this.epi.counter+0.5)*vhi.sqLength+2*Math.floor(this.epi.counter/vhi.helixset.divLength);
	    this.epi.strand.connection.remove();
	    this.epi.strand.connection = new Kinetic.Line({
		    points: [this.epi.strand.endptL.centerX, this.epi.strand.endptL.centerY, this.epi.strand.endptR.centerX, this.epi.strand.endptR.centerY],
		    stroke: "#FF0000",
		    strokeWidth: 3
		});
	    this.epi.strand.group.add(this.epi.strand.connection);
	    this.epi.strand.layer.draw();
	});
    this.layer.add(this.shape);
    vhi.canvas.add(this.layer);
    this.layer.draw();
}

function UI_StrandItem(epi1, epi2) { //must have 2 EPIs to create a strand
    if(epi1.endtype + epi2.endtype != 8) {
	alert("A strand's endpoints must be a 3\' and a 5\'!");
	throw "stop execution";
    }
    if(epi1.helixitem != epi2.helixitem) {
	alert("Two endpoints must be on the same helix!");
	throw "stop execution";
    }
    if(epi1.counter <  epi2.counter) {
	this.endptL = epi1;
	this.endptR = epi2;
    }
    else {
	this.endptL = epi2;
	this.endptR = epi1;
    }
    epi1.strand = this;
    epi2.strand = this;
    this.layer = epi1.helixitem.helixset.slayer;
    this.connection = new Kinetic.Line({
	    points: [epi1.centerX, epi1.centerY, epi2.centerX, epi2.centerY],
	    stroke: "#FF0000",
	    strokeWidth: 3
	});
    this.group = new Kinetic.Group({
	    draggable: true
	});
    this.group.add(this.connection);
    epi1.shape.moveTo(this.group);
    epi1.layer.remove();
    epi2.shape.moveTo(this.group);
    epi2.layer.remove();
    this.layer.add(this.group);
    this.layer.moveToTop();
    this.layer.draw();
}