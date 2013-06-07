/* MODELS HERE */

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
    this.undoStack = new Stack();
}
