var VirtualHelixSetItem = Backbone.View.extend({
    initialize: function(){
        this.handler = this.options.handler;
        this.part = this.options.part;
        this.vhItems = new Array();
    },
    events: {
        "mousemove" : "onMouseMove",
    },
    render: function(){
        var h = this.handler;

        //remove existing views.
        for(var i=0;i<this.vhItems.length;i++){
        //    console.log(this.vhItems[i]);
            this.vhItems[i].close();
        }
        //empty the array.
        this.vhItems.length = 0;
        this.handler.clearLayers();

        //create new ones.
        var list = this.vhItems;
        this.collection.each(function(vh){
            var vhItem = new VirtualHelixItem({
                model:vh,
                handler: h,
            });
            list.push(vhItem);
        });
        this.handler.render();
    },

    onMouseMove: function(e){
        //calculate which helix you are on. change colour.
        var coord = this.part.latticePositionXYToCoord(e.pageX, e.pageY, 1.0);
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
        var pos = this.part.latticeCoordToPositionXY(coord.row,
            coord.col);
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
        var pos = this.part.latticeCoordToPositionXY(this.row,
            this.col);
        this.handler = this.options.handler;
        var helixNum = this.options.model.hID;

        var idx = this.part.activeBaseIndex();
        var params;
        if(this.model.hasStrandAt(idx)){
            params = {
                fill: colours.orangefill,
                stroke: colours.orangestroke,
                strokewidth: colours.strokewidth,
                layer: Constants.helixLayer,
            };
        }
        else{
            params = {
                fill: colours.lightorangefill,
                stroke: colours.lightorangestroke,
                strokewidth: colours.strokewidth,
                layer: Constants.helixLayer,
            };
        }
        this.polygon = this.handler.createCircle(pos.x, 
            pos.y, this.part.radius, params,
            helixNum
            );
    },
});
