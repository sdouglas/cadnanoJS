var VirtualHelixSetItem = Backbone.View.extend({
    initialize: function(){
        this.handler = this.options.handler;
        console.log(this.handler);
    },
    render: function(){
                console.log('in render functin vhitemset');
            console.log(this.handler);
            var handle = this.handler;
        this.collection.each(function(model){
            console.log('creating one for each helix');
            var view = new VirtualHelixItem({
                el: $('#sliceView'),
                model: model,
                handler: handle,
            });
            view.render();
        });
    },
    events: {
        "click" : "justClicked",
    },
    justClicked: function(){
        console.log("clicked the vhsetitem.");
    },
});

var VirtualHelixItem = Backbone.View.extend ({
    initialize: function(){
                    console.log(this.model);
        this.part = this.options.model.getPart();
        this.row = this.model.getRow();
        this.col = this.options.model.getCol();
        var pos = this.part.latticeCoordToPositionXY(this.row,
            this.col);
        console.log(this.row + ',' + this.col);
        this.handler = this.options.handler;

        console.log(this.part);
        console.log(pos.x + ',' + pos.y);
        this.polygon = this.handler.createCircle(pos.x, 
            pos.y, this.part.radius);
        this.hoverFill = '#33CCFF';
        this.emptyFill = '#F0F0F0';
    },

    events: {
        "click"     : "helixClicked",
        "mouseover" : "mouseHoverEventOn",
        "mouseout"  : "mouseHoverEventOff",
    },

    helixClicked: function(){
        console.log('just clicked this');
    },
    setMouseEvents: function(polygon){
        polygon.on("mouseover", this.mouseHoverEventOn);
        polygon.on("mouseout", this.mouseHoverEventOff);
        polygon.on("click", this.mouseClickEvent);
    },

    render: function(){
        this.handler.render();
    },

    mouseHoverEventOn: function(e){
        console.log(this);
        //if(!this.model.contains(e.targetX,e.targetY))
        /*
        if(!this.partItem.part.isHelixSelected(this.row,
                this.col)){
            this.polygon.setFill(this.hoverFill);
            this.handler.render();
        }
        this.setFill('#33CCFF');
        */
    },

    mouseHoverEventOff: function(){
                            /*
        if(!this.partItem.part.isHelixSelected(this.row,
                this.col)){
            this.polygon.setFill(this.emptyFill);
            this.handler.render();
        this.setFill('#F0F0F0');
        }*/
    },
    mouseClickEvent: function(){
        //
    },
});
