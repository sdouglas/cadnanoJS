/* MODELS HERE */

var Document = Backbone.Model.extend({
    initialize: function(){
        this.parts = new Array();
    },
    LatticeType: 0,
    localStorage: new Backbone.LocalStorage("cadnano"),
    isSaved: function(){
        return true;
    },
    createHoneyCombPart: function(){
            this.addPart(new HoneyCombPart(this));
    },
    createSquarePart: function(){
            this.addPart(new SquarePart(this));
    },
    part: function(){
         return this.parts[0]; 
    },
    addPart: function(modelPart){
        this.parts.push(modelPart);
        this.set({hasPart:"yes"});
        //trigger an event?
    },
});
