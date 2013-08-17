var VirtualHelixSetItem = Backbone.View.extend({
    initialize: function(){
        this.handler = this.options.handler;
        this.part = this.options.part;
        this.partItem = this.options.parent;
        this.vhItemArray = new Array();
    },
    
    events: {
        "mousemove" : "onMouseMove",
    },

    render: function(virtualHelix){
        var list = this.vhItemArray;
        var h = this.handler;

        if(virtualHelix) {
            var vh = virtualHelix;
            if(list[vh.id] instanceof VirtualHelixItem){
                list[vh.id].update();
            }
            else{
                var vhItem = new VirtualHelixItem({
                    model:vh,
                    handler: h,
                });
                list[vh.id] = vhItem;
            }
	    this.handler.render();
            return;
        }

        //create new ones.
        this.collection.each(function(vh){
            if(list[vh.id]) {
                list[vh.id].update();
                return;
            }
            var vhItem = new VirtualHelixItem({
                model:vh,
                handler: h,
            });
            list[vh.id] = vhItem;
        });
        this.handler.render();
    },

    onMouseMove: function(e){
        //calculate which helix you are on. change colour.
        var coord = this.part.latticePositionXYToCoord(e.pageX, e.pageY, this.partItem.zoomFactor);
        if(coord.row === -1 || coord.col === -1) {
            this.handler.removeHover();
            return;
        }
        if(coord.row >= this.part.getRows() || coord.col >= this.part.getCols()) {
            this.handler.removeHover();
            return;
        }
        var id = this.part.getStorageID(coord.row,coord.col);
        var helixModel = this.part.getModelHelix(id);
        var pos = this.part.latticeCoordToPositionXY(coord.row,coord.col);
        //change helix colour.
        var params = {
            fill: colours.bluefill,
            stroke: colours.bluestroke,
            strokewidth: colours.hoverwidth,
        };
        this.handler.addHover(pos.x,pos.y,this.part.radius,params);
    },

    remove: function(){
    },

});

var VirtualHelixItem = Backbone.View.extend ({
    initialize: function(){
        this.part = this.options.model.getPart();
        this.row = this.model.getRow();
        this.col = this.options.model.getCol();
        this.pos = this.part.latticeCoordToPositionXY(this.row,this.col);
        this.handler = this.options.handler;
        this.helixNum = this.options.model.hID;
        var params;
        params = {
            fill: colours.lightorangefill,
            stroke: colours.lightorangestroke,
            strokewidth: colours.strokewidth,
            layer: Constants.helixLayer,
        };
        this.polygon = this.handler.createCircle(this.pos.x, 
            this.pos.y, this.part.radius, params,
            this.helixNum
            );
        this.update();
        //this.handler.render();
    },

    update: function(){
        console.log('in vhitem render');
        var idx = this.part.activeBaseIndex();
        if(this.model.hasStrandAt(idx)){
            console.log('yeah already have a strand');
            this.polygon.setFill(colours.orangefill);
            this.polygon.setStroke(colours.orangeStroke);
        }
        else{
            console.log('no strand here');
            this.polygon.setFill(colours.lightorangefill);
            this.polygon.setStroke(colours.lightorangeStroke);
        }
    },
});
