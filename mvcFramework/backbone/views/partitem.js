var PartItem = Backbone.View.extend({
    initialize: function(){
        this.who = this.options.who;
        this.params = this.options.params;
        this.handler = new viewHandler(this.who);
        this.handler.setParams(this.params);
        this.chosenHelixHash = new Array();
        this.connectSignalsSlots();
    },

    connectSignalsSlots: function(){
        this.listenTo(this.part,
            cadnanoEvents.partVirtualHelixAddedSignal,
            this.partVirtualHelixAddedSlot
            );
        this.listenTo(this.part,
            cadnanoEvents.partVirtualHelixRemovedSignal,
            this.partVirtualHelixRemovedSlot
            );
        this.listenTo(this.part,
            cadnanoEvents.partHelicesInitializedSignal,
            this.partHelicesInitializedSlot
            );
        this.listenTo(this.part,
            cadnanoEvents.partRemovedSignal,
            this.partRemovedSlot
            );
        this.listenTo(this.part,
            cadnanoEvents.partActiveSliceResizedSignal,
            this.partActiveSliceResizedSlot
        );
        this.listenTo(this.part,
            cadnanoEvents.partStrandChangedSignal,
            this.partStrandChangedSlot
        );
    },

    isHelixSelected: function(row,col){
        if(this.chosenHelixHash[row][col])
            return true;
        return false;
    },
});

var SlicePartItem = PartItem.extend({
    initialize: function(){
	this.isDragging = false;
	this.zoomFactor = 1;
        this.part = this.options.part;
        this._super({
            part:   this.options.part,
            param:  this.options.params,
            who:    this.options.who,
        });
        //Create the empty helix set layer.
        this.emptyItemSet = new EmptyHelixSetItem({
            el: $('#sliceView'),
            part: this.options.part,
            handler: this.handler,
	    parent: this
        });
        this.setLattice(this.part.generatorFullLattice());

        //Create the virtual helix item layer.
        this.vhItemSet = new VirtualHelixSetItem({
            el: $('#sliceView'),
            part: this.options.part,
            handler: this.handler,
	    parent: this,
            collection: this.options.part.getVHSet(),
        });

	this.helixInstanceList = new Array();
	this.dontClickHelix = false;

        //Create the text item layer.
        
        //console.log(this.el);
        //this.handler.addToDom(this.el);
    },
    
    render: function(){
        this.handler.render();
    },

    events: {
	"mousedown" : "onmousedown",
	"mousemove" : "onmousemove",
	"mouseup" : "onmouseup"
    },

    onmousedown: function() {
	this.helixInstanceList.length = 0;
	this.isDragging = true;
    },

    onmousemove: function(e) {
	if(this.isDragging) {
	    var latestPos = this.part.latticePositionXYToCoord(e.pageX, e.pageY, this.zoomFactor);
	    if(latestPos.row === -1) return;
	    for(var i=0; i<this.helixInstanceList.length; i++) {
		if(latestPos.row === this.helixInstanceList[i].row && latestPos.col === this.helixInstanceList[i].col) {
		    return;
		}
	    }
	    this.helixInstanceList.push(latestPos); //add to list if latestPos is a valid position
	    this.emptyItemSet.onMouseClick(e); //instancing the helix item
	}
    },

    onmouseup: function() {
	console.log(this.helixInstanceList);
	if(this.helixInstanceList.length > 0) { //make sure it doesn't interfere with normal clicking
	    this.dontClickHelix = true; //last helix would also trigger onMouseClick on helix item itself, we don't want double
	}
	this.isDragging = false;
    },

    setLattice: function(newCoords){
        for (var i in newCoords){
            this.emptyItemSet.createEmptyHelix(newCoords[i]);
        }
        this.part.initializedHelices(true);
    },
    partHelicesInitializedSlot: function(){
        this.emptyItemSet.render();
    },
    partVirtualHelixAddedSlot: function(virtualHelix){
        //Add the virtual helix item to a hash.
        //Change the color of the virtual helix item
        //to show selection.
        this.vhItemSet.render();
    }, 
    partVirtualHelixRemovedSlot: function(virtualHelix){
        //Add the virtual helix item to a hash.
        //Change the color of the virtual helix item
        //to show selection.
        this.vhItemSet.render();
    }, 
   
    partStrandChangedSlot: function(){
        this.vhItemSet.render();
    },

    partRemovedSlot: function(){
        console.log(this.part);
        this.emptyItemSet.close();
        this.emptyItemSet.remove();
        this.vhItemSet.close();
        this.vhItemSet.remove();
        //TODO: remove the if condition - a hack.
        if(this.handler){
            this.handler.remove();
            this.handler.render();
            delete this.handler;
        }
    },

    partActiveSliceResizedSlot: function(){
        //Check each helix, and see which
        //ones fall under the scaffold, and which ones
        //do not.
        this.vhItemSet.render();
    },

    //TODO
    //addScafifStapIsMissing
    //addStapifScafIsMissing

});

var PathPartItem = PartItem.extend({
    initialize: function(){
        this.part = this.options.part;
        this._super({
            part:   this.options.part,
            param:  this.options.params,
            who:    this.options.who,
        });
        this.connectPathSignalsSlots();
        this.pathItemSet = new PathHelixSetItem({
            el: $('#pathView'),
            part: this.options.part,
            handler: this.handler,
            collection: this.options.part.getVHSet(),
        });

        //PreXoverItems are stored here.
        this.preXoverItems = [];
    },
    connectPathSignalsSlots: function(){
        this.listenTo(this.part,
            cadnanoEvents.updatePreXoverItemsSignal,
            this.updatePreXoverItemsSlot);
	this.listenTo(this.part,
		      cadnanoEvents.partStepSizeChangedSignal,
		      this.partStepSizeChangedSlot
		      );
    },

    events: {
	"mousedown" : "onmousedown",
    },

    partVirtualHelixAddedSlot: function(virtualHelix){
	this.pathItemSet.render();
	this.pathItemSet.activesliceItem.updateHeight();
        //TODO
        //Add in a new path in the path view panel.
    },

    partVirtualHelixRemovedSlot:
    function(virtualHelix){
	this.pathItemSet.removeHelix(virtualHelix.id);
	this.pathItemSet.activesliceItem.updateHeight();
    },

    updatePreXoverItemsSlot:
    function(virtualHelix){
     	/*
	  0: complementary VirtualHelix
	  1: position
	  2: 1 = is staple strand
	  3: true = on left
	 */

	this.pathItemSet.prexoverlayer.destroyChildren();

	if(virtualHelix){
	console.log('in updatePreXoverItemsSlot');
        var xoverList = this.part.potentialCrossoverList(virtualHelix);

	for(var i=0; i<xoverList.length; i++) {
        /*
           console.log(
           virtualHelix.id+','+
           xoverList[i][0].id+','+
           xoverList[i][1]+','+
           xoverList[i][2]+','+
           xoverList[i][3]
           );

           console.log(
           xoverList[i][0].id+','+
           virtualHelix.id+','+
           xoverList[i][1]+','+
           xoverList[i][2]+','+
           xoverList[i][3]
           );
           */

	    var preXover = new PreXoverItem(
                this.pathItemSet.phItemArray[virtualHelix.id],
                this.pathItemSet.phItemArray[xoverList[i][0].id],
                xoverList[i][1],
                xoverList[i][2],
                xoverList[i][3]);

	    var preXoverC = new PreXoverItem(
                this.pathItemSet.phItemArray[xoverList[i][0].id],
                this.pathItemSet.phItemArray[virtualHelix.id],
                xoverList[i][1],
                xoverList[i][2],
                xoverList[i][3]
                );
	}
	}
	this.pathItemSet.prexoverlayer.draw();
    },

    partStepSizeChangedSlot: function(){
	var slicebar = this.pathItemSet.activesliceItem;
	var pCounter = slicebar.counter;
	slicebar.adjustCounter(slicebar.counter);
	if(slicebar.counter !== pCounter) {
	    slicebar.update();
	}
	this.pathItemSet.render();
    },

    onmousedown: function() {
	/*
	var itemArray = this.pathItemSet.selectedItems;
	var itemArrayLength = itemArray.length;
	for(var i=0; i<itemArrayLength; i++) {
	    itemArray[i].itemDeselected();
	}
	this.pathItemSet.selectedItems.length = 0;

	var itemArrayTemp = this.pathItemSet.selectedItemsTemp;
	var itemArrayTempLength = itemArrayTemp.length;
	for(var i=0; i<itemArrayTempLength; i++) {
	    itemArrayTemp[i].itemSelected();
	}
	this.pathItemSet.selectedItemsTemp.length = 0;

	if(itemArrayLength !== itemArrayTempLength) {
	    this.pathItemSet.strandlayer.draw();
	}
	*/
    },

});
