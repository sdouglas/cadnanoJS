$(function(){
var Box = Backbone.Model.extend({
    defaults: {
                  x: 0,
    y: 0,
    w: 1,
    h: 1,
    color: "#FF9000",
    linewidth: 3
              }
});

var BoxSet = Backbone.Collection.extend({
    model:Box 
});

var BoxView= Backbone.View.extend({
    initialize: function(){

                    this.listenTo(this.model, 'change', this.render);
                },
    events :{
                'click' : 'boxclicked',
            },
    render : function() {
                 console.log("rendered");
                 var model=this.model, ctx=this.options.ctx;

                 ctx.fillStyle = "#FF9000";
                 ctx.globalAlpha = 0.1;
                 ctx.fillRect(model.get("x"), model.get("y"), model.get("w"), model.get("h")); //transparent box in the back
                 ctx.globalAlpha = 1;
                 ctx.strokeStyle = model.get("color");
                 ctx.lineWidth = model.get("linewidth");
                 ctx.strokeRect(model.get("x"), model.get("y"), model.get("w"), model.get("h")); //rectangle on top  
             },

    boxclicked: function(e) {
                    console.log(e);
                    console.log('clicked the box');
                    var newx = this.model.get("x") + 10;
                    this.model.set({x:newx});
                },
});


var SetView= Backbone.View.extend({
    render: function() {
                console.log(this.$el);
                console.log(this.$el.get(0));
                var atx=this.$el;
                var ctx = atx[0].getContext("2d");

                this.collection.each(function(model) {
                    var view=new BoxView({ctx:ctx,model:model,el:$('canvas')});
                    view.render();            

                })
            }
});



var c=new BoxSet();
c.add({x:150,y:150,w:100,h:100});
c.add({x:10,y:10,w:100,h:100});

var v=new SetView({
    el:$("canvas"),
    collection :c
});
v.render();

});
