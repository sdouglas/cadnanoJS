$(document).ready(START);

function START(){
   var dc = new DocumentController();
}

function Button(flag){
    this.flag = flag;
    this.mouseClickedFlag = flag;
    this.diffX = 0;
    this.diffY = 0;
    this.currX = 0;
    this.currY = 0;
    console.log('initially, in constructor: flag=' + this.flag);

    //note that shift's keycode is 16, so please
    //do not change it.
    this.bVal = {
        'zoom': 2,
        'edit': 4,
        'move': 8,
        'shift': 16 
    };
    this.previousHelix_ = undefined;
}

Button.prototype.getCurrX = function(){
    return this.currX;
};

Button.prototype.getCurrY = function(){
    return this.currY;
};

Button.prototype.setCurrX = function(posn){
    this.currX = posn;
};

Button.prototype.setCurrY = function(posn){
    this.currY = posn;
};

Button.prototype.setPreviousHelix = function(id){
    if(id){
        this.previousHelix_ = id;
    }
};

Button.prototype.previousHelix = function(){
        return this.previousHelix_;
};

Button.prototype.mouseHover = function(e, view){
    if(!e.target.id) return;
    if ((this.flag & 4)){
        var foo = $.proxy(view.dispatch, view);
        keyOn = {
            action: 'hover',
            val: e.target.id
        };
        keyOff = {
            action: 'nohover',
            val: this.previousHelix()
        };
        foo(keyOn);
        console.log(this.previousHelix());
        foo(keyOff);
        console.log(this.previousHelix() + '-to-' + e.target.id);
        this.setPreviousHelix(e.target.id);
        console.log(e);
    }
};

Button.prototype.mouseAction = function(e, view){
    //Zoom in/out
    if(!e.target.id) return;

    console.log('testing _b flag: ' + this.flag);
    var foo = $.proxy(view.dispatch, view);
    var key = {
        action: 'zoom',
        val: 0
    };
    if(this.flag & 2) {
        if (this.flag & 16){
            key.val = -0.1;
        }
        else{
            key.val = 0.1;
        }
        foo(key);
    } else if (this.flag & 4){
        //trying to read in the svg node.
        key = {
            action: 'edit',
            val: e.target.id
        };
        console.log(e.target.id);
        foo(key);
    }
};

Button.prototype.ifKeyPressed = function(e){
    console.log(this);
    console.log('testing: in inKeyPressed: get=' + this.getCurrX() + "," + this.getCurrY() );
    console.log('initially, in inKeyPressed: flag=' + this.flag);
    console.log('in inKeyPressed: key=' + e.keyCode);
    if(e.keyCode === 16){
        this.flag |= 16;
        console.log('in inKeyPressed: flag=' + this.flag);
    }
};

Button.prototype.ifKeyUnpressed = function(e){
    console.log('in inKeyUnpressed: flag=' + e.keyCode);
    if(e.keyCode === 16){
        this.flag -= 16;
        console.log('in inKeyUnpressed: flag=' + this.flag);
    }
};

Button.prototype.ifMousePressed = function(id){
    console.log("in function ifMousePressed, id=" + id);
    this.flag = this.bVal[id];
    console.log("in function ifMousePressed, flag=" + this.flag);
};

Button.prototype.ifMouseKept = function(e){
    if(this.flag & 8){
        console.log(this);
        console.log('mouse down');
        console.log('curr:' + this.getCurrX()+','+this.getCurrY());
        this.mouseClickedFlag = 2;
        this.diffX = this.getCurrX()-e.clientX;
        this.diffY = this.getCurrY()-e.clientY;
    }
};

Button.prototype.Zoom = function(e,view){
    //Zoom in/out
    if(!e.target.id) return;

    if(this.flag & 2) {
        console.log('testing _b flag: ' + this.flag);
        var delta=e.detail? e.detail*(-120) : e.wheelDelta;
        console.log('delta=' + delta + ',detail:' + e.detail + ',e.wheelDelta=' + e.wheelDelta);
        var zoomval = delta/240;
        console.log(zoomval);
        var foo = $.proxy(view.dispatch, view);
        var key = {
            action: 'zoom',
            val: zoomval
        };
        console.log('calling foo');
        foo(key);
    }
};

Button.prototype.ifMouseMoved = function(e,view){
    if(!e.target.id) return;
    if(this.mouseClickedFlag & 2){
        console.log(this);
        console.log('moving mouse' + e.clientX + ',' + e.clientY);
        this.setCurrX(e.clientX + this.diffX);
        this.setCurrY(e.clientY + this.diffY);
        console.log(this.getCurrX() + ";;;;;" + this.getCurrY());
        var key = {
            action: 'move', 
            x: this.getCurrX(), 
            y: this.getCurrY()
        }; 
        var foo = $.proxy(view.dispatch, view);
        foo(key);
    }
};

Button.prototype.ifMouseLeft = function(e){
    if(this.mouseClickedFlag & 2){
        console.log('mouse up');
        this.mouseClickedFlag -= 2;
        this.diffX = 0;
        this.diffY = 0;
    }
    //
};

/* CONTROLLERS HERE */
function DocumentController(){
    //click edit
    //click scroll/zoom
    //click honey comb
    //click square
    //actual mouse movements

    sliceView = new DocumentItem();
    sliceView.init();

    editMenu = new Button(0);
    editMenu.setCurrX(document.getElementById("lattice").offsetLeft);
    editMenu.setCurrY(document.getElementById("lattice").offsetTop);
    console.log(editMenu.getCurrX()+','+editMenu.getCurrY());

    document.onkeydown=$.proxy(editMenu.ifKeyPressed, editMenu);
    document.onkeyup=$.proxy(editMenu.ifKeyUnpressed, editMenu);
    document.getElementById("slice-view").onmousedown=$.proxy(editMenu.ifMouseKept, editMenu);
    document.getElementById("slice-view").onmouseup=$.proxy(editMenu.ifMouseLeft, editMenu);

    document.getElementById("complete-doc").onmousewheel=function(e){
        var foo = $.proxy(editMenu.Zoom,editMenu);
        foo(e,sliceView);
    };
    document.getElementById("slice-view").onmousemove=function(e){
        var foo = $.proxy(editMenu.ifMouseMoved,editMenu);
        foo(e,sliceView);
    };
    document.getElementById("slice-view").onmouseover=function(e){
        var foo = $.proxy(editMenu.mouseHover,editMenu);
        foo(e,sliceView);
    };
    document.getElementById("slice-view").onclick=function(e){
        var foo = $.proxy(editMenu.mouseAction,editMenu);
        foo(e,sliceView);
    };
    document.getElementById("buttons").onclick=function(e){
        console.log(e.target.id);
        var foo = $.proxy(editMenu.ifMousePressed,editMenu);
        foo(e.target.id);
    };
}
