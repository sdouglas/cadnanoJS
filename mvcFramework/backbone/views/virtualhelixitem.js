var VirtualHelixSetItem = Backbone.View.extend({
    initialize: function(){
        this.handler = this.options.handler;
        this.part = this.options.part;
        console.log(this.handler);
    },
    events: {
        "mousemove" : "onMouseMove",
    },
    render: function(){
        console.log('in render functin vhitemset');
        var h = this.handler;
        this.collection.each(function(vh){
            var vhItem = new VirtualHelixItem({
                model:vh,
                handler: h,
            });
        });
        this.handler.render();
    },

    onMouseOver: function(e){
        //calculate which helix you are on. change colour.
        console.log("hovering");
        coord = {row:5, col:5};
        var id = this.part.getStorageID(coord.row,coord.col);
        var helixModel = this.part.getModelHelix(id);
        console.log(helixModel);
    },

    remove: function(){
    },

});

var VirtualHelixItem = Backbone.View.extend ({
    initialize: function(){
        console.log(this.options);
        this.part = this.options.model.getPart();
        this.row = this.model.getRow();
        this.col = this.options.model.getCol();
        console.log(this.row + ',' + this.col);
        var pos = this.part.latticeCoordToPositionXY(this.row,
            this.col);
        console.log(pos.x + ',' + pos.y);
        this.handler = this.options.handler;

        var params = {
            fill: colours.orangefill,
            stroke: colours.orangestroke,
            strokewidth: colours.strokewidth,
        };
        this.polygon = this.handler.createCircle(pos.x, 
            pos.y, this.part.radius, params);
    },
});
