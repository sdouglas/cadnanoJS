function SliceStack() {
    this.stack = new Array();
    this.undostack = new Array();    

    SliceStack.prototype.add = function(x,y) {
	var loc = new Array();
	loc[0] = x;
	loc[1] = y;
	this.stack.push(loc);
    }

    SliceStack.prototype.undo = function() {
	if(this.stack.length > 0) {
	    this.undostack[this.undostack.length] = this.stack[this.stack.length-1];
	    this.stack.pop();
	}
	else {
	    alert("There are no actions to undo!");
	}
    }

    SliceStack.prototype.redo = function() {
	if(this.undostack.length > 0) {
	    this.stack[this.stack.length] = this.undostack[this.undostack.length-1];
	    this.undostack.pop();
	}
	else {
	    alert("There are no actions to redo!");
	}
    }

    SliceStack.prototype.contains = function(x,y) {
	if(this.stack.length === 0) {
	    return -1;
	}
	for(var i=0; i<this.stack.length; i++) {
	    if(this.stack[i][0] === x && this.stack[i][1] === y) {
		return i;
	    }
	}
	return -1;
    }
}