var DocControl;
$(document).ready(START);

function printFN(from,to){
    from = from.substr('function '.length);
    from = from.substr(0, from.indexOf('('));
    var str = from;
    str += "::";
    str += to;
    console.log(str);
}

function START(){
   DocControl = new DocumentController();
}

/* CONTROLLERS HERE */
function DocumentController(){
    //Create the document model.
    var me = this;

    this.newDocument = function(){
        printFN(arguments.callee.caller.toString(), "newDocument");
        //check if current document has been saved.
        if(me.currDoc){
            if(!me.currDoc.isSaved()){
                //askIfWantToSaveTheDoc();
            }
            me.currDoc.remove();
        }
        me.currDoc = new Document();
        return true;
    };

    //Create both part items - by emitting a partCreatedSignal
    this.createHoneyCombLattice = function(){
        printFN(arguments.callee.caller.toString(), "createHoneyCombLattice");
        me.currDoc.createHoneyCombPart();
    };

    this.createSquareLattice = function(){
        printFN(arguments.callee.caller.toString(), "createSquareLattice");
        me.currDoc.createSquarePart();
    };

    this.connectSignals = function(){
        me.currDoc.documentPartAddedSignal.add(me.currDocItem.documentPartAddedSlot);
    };

    if (me.newDocument()){
        //Create the document window.
        me.currDocItem = new DocumentItem(me.currDoc);

        me.connectSignals();
    }

}
