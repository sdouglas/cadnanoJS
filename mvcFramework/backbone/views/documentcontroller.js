$(document).ready(main);

var DocumentController = Backbone.View.extend({
    initialize: function(){
        this.currDoc = this.options.currDoc;
        this.DocumentWindow = new DocumentItem({
            el:         $(".drawnPanels"),
            currDoc:    this.currDoc,
        });
        this.currDoc.fetch();
        console.log("creating new doc");
        if(this.currDoc.part()){
            console.log(this.currDoc.part().stepSize);
        }
    },

    newDocument: 
    function(){
        if(!this.currDoc.isSaved()){
            //askIfWantToSaveTheDoc();
        }
        this.currDoc.destroy();
        this.DocumentWindow.close();

        this.currDoc = new Document();
        this.DocumentWindow = new DocumentItem({
            el:         $(".drawnPanels"),
            currDoc:    this.currDoc,
        });
        return true;
    },

    saveDocument:
    function(){
        if(this.currDoc){
            var obj = encode(this.currDoc);
            console.log(obj);
        }
    },

    openDocument:
    function(){
    },
    
    //Create both part items - by emitting a partCreatedSignal
    createHoneyCombLattice: function(){
        this.currDoc.createHoneyCombPart();
    },

    createSquareLattice: function(){
        this.currDoc.createSquarePart();
    },

    setPathTool: function(tool) {
	this.currDoc.pathTool = tool;
    },

});

function main(){
    Origami = new Document();
    DocControl = new DocumentController({
        el: $(".mainWindow"),
        currDoc: Origami,
    });
}
