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
        var mypart = new HoneyCombPart({
            currDoc:this,
        });
        mypart.setDoc(this);
        this.addPart(mypart);
    },
    createSquarePart: function(){
        var mypart = new SquarePart({
            currDoc:this,
        });
        mypart.setDoc(this);
        this.addPart(mypart);
    },
    part: function(){
         return this.parts[0]; 
    },
    addPart: function(modelPart){
        this.parts.push(modelPart);
        this.trigger(cadnanoEvents.documentPartAddedSignal, 
                modelPart);
        //trigger an event?
    },
});
