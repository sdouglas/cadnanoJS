/* MODELS HERE */

/* Stack model */

function Stack(){
    this.storage_ = new Array();
}

Stack.prototype.topMost = function(){
    return this.storage_[this.storage_.length-1];
};

Stack.prototype.pop = function(){
    return this.storage_.pop();
};

Stack.prototype.push = function(action){
    this.storage_.push(action);
};

function Document(){
    var me = this;
    console.log("document");
    console.log(me);
    me.undoStack = new Stack();
    me.parts = [];
    me.documentPartAddedSignal = new signals.Signal();

    //define what parts are.
    HoneyCombPart.prototype = Object.create(Part.prototype);
    HoneyCombPart.prototype.constructor = HoneyCombPart;
    SquarePart.prototype = Object.create(Part.prototype);
    SquarePart.prototype.constructor = SquarePart;

//Returns true/false on whether this document 
//has already been saved or not.
//new will call this to check.
this.isSaved = function(){
    return true;
};


//Delete all items etc. so as to minimize
//any memory leaks.
this.remove = function(){
};

//This is where the document emits a signal
//saying that a part (origami) object has
//been created. The signal is received by
//two views - PathItem and the SliceItem,
//which each update their view based on this
//signal.
this.createHoneyCombPart = function(){
    //Do not create a new part if one already exists.
    if(me.parts.length>0)
        return;
    me.parts.push(new HoneyCombPart(me));
    me.documentPartAddedSignal.dispatch();
};

this.createSquarePart = function(){
    if(me.parts.length>0)
        return;
    me.parts.push(new SquarePart(me));
    me.documentPartAddedSignal.dispatch();
};

this.part = function(){
    console.log(me.parts[0]);
    return me.parts[0];
};
}
