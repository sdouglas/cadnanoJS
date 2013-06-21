var VirtualHelixItem = Backbone.View.extend ({
    initialize: function(PartItem, row, col, handler){
        this.partItem = PartItem;
        var pos = this.partItem.part.latticeCoordToPositionXY(row,col);
        handler.createCircle(pos.x, pos.y, this.partItem.radius);
    },
});
