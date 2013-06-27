$(document).ready(main);

var DocumentController = Backbone.View.extend({
    initialize: function(){
        this.newDocument();
        console.log("creating new doc");
    },
    
    newDocument: function(){
        if(this.currDoc){
            if(!this.currDoc.isSaved()){
                //askIfWantToSaveTheDoc();
            }
            this.currDoc.destroy();
            this.DocumentWindow.reset();
        }
        this.currDoc = new Document();
        this.DocumentWindow = new DocumentItem({
            el:         $("#drawnPanels"),
            currDoc:    this.currDoc,
        });
        return true;
    },
    
    //Create both part items - by emitting a partCreatedSignal
    createHoneyCombLattice: function(){
        this.currDoc.createHoneyCombPart();
    },

    createSquareLattice: function(){
        this.currDoc.createSquarePart();
    },
});

function main(){
    DocControl = new DocumentController({
        el: $("#mainWindow"),
    });
}
