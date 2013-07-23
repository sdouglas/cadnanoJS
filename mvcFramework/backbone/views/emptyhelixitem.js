var EmptyHelixSetItem = Backbone.View.extend({
    initialize: function(){
        this.handler = this.options.handler;
        this.part = this.options.part;

        this.emptyHelixHash = new Array();
    },
    
    createEmptyHelix: function(coord){
        var view = new EmptyHelixItem({
            el: $('#sliceView'),
            handler: this.handler,
            part: this.part,
            row: coord.row,
            col: coord.col,
        });
        if(!this.emptyHelixHash[coord.row]){
            this.emptyHelixHash[coord.row] = new Array();
        }
        this.emptyHelixHash[coord.row][coord.col] = view;
    },

    render: function(){
        this.handler.render();
    },

    events: {
        "click" : "onMouseClick",
    },

    onMouseClick: function(e){
        console.log("clicked the vhsetitem.");
        //Figure out which helix was clicked.
        var coord = this.part.latticePositionXYToCoord(e.pageX, e.pageY, 1.0);
        if(coord.row === -1 || coord.col === -1) return;

        var id = this.part.getStorageID(coord.row,coord.col);
        var helixModel = this.part.getModelHelix(id);
        //Do whatever you need to to the helix.
        //if selected, then add staple/scaffold.
        //if unselected, then create a helix model.
        //var idx = this.part.activeBaseIndex();
        if(!helixModel){
            //create a new vhmodel and insert it.
            helixModel = this.part.createVirtualHelix(
                    coord.row,
                    coord.col
                    );
        }
        else {
            var idx = this.part.activeBaseIndex();
            if (!helixModel.scafStrandSet.hasStrandAt(idx-1,idx+1)){
                console.log('creating strand at :' + idx);
                helixModel.scafStrandSet.createStrand(idx-1,idx+1);
            }
        }
    },

    remove: function(){
        delete this.emptyHelixHash;
        this.render();
    },
});

var EmptyHelixItem = Backbone.View.extend ({
    initialize: function(){
        this.part = this.options.part;
        this.row = this.options.row;
        this.col = this.options.col;
        var pos = this.part.latticeCoordToPositionXY(this.row,
            this.col);
        //console.log(this.row + ',' + this.col);
        this.handler = this.options.handler;

        //console.log(this.part);
        //console.log(pos.x + ',' + pos.y);
        var params = {
            fill: colours.grayfill,
            stroke: colours.graystroke,
            strokewidth: colours.strokewidth,
        };
        this.polygon = this.handler.createCircle(pos.x, 
            pos.y, this.part.radius, params);
    },
});
