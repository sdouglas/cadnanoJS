var VirtualHelixItem = Backbone.View.extend ({
    initialize: function(){
        this.partItem = this.options.pItem;
        var row = this.options.row;
        var col = this.options.col;
        var pos = this.partItem.part.latticeCoordToPositionXY(row,col);
        var handler = this.options.handler;

        //console.log(pos.x + "," + pos.y + "," + this.partItem.part.radius);
        handler.createCircle(pos.x, pos.y, this.partItem.part.radius);
        console.log(this.handler);
    },
});
