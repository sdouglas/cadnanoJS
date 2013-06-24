/* CONTROLLERS HERE */
function ViewRootController(part,partItem){
    //need both document and part.
    var me = this;
    me.currDoc = part.currDoc;
    me.partModel = part;
    me.partItem = partItem;

    console.log(this);
    me.connectSignals();
    this.connectSignals = function(){
        me.currDoc.documentPartAddedSignal.add(me.partItem.documentPartAddedSlot);
    };

}
