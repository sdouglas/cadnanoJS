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
    this.previousHelix = undefined;
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
        this.previousHelix = id;
    }
};

Button.prototype.previousHelix = function(){
        return this.previousHelix;
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
    console.log(view);
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

/*******DOCUMENTITEM*********/
DocumentItem = function(ModelDoc){
    var me = this;
    console.log("documentitem");
    console.log(me);
    me.doc = ModelDoc;

    //Slice View Parameters.
    var sliceViewWidth = $('#slice-view').css('width');
    if(null === sliceViewWidth) sliceViewWidth = Constants.defaultViewWidth;
    var sliceViewHeight = $('#slice-view').css('height');
    if(null === sliceViewHeight) sliceViewHeight = Constants.defaultViewHeight;
    
    me.sliceViewParams = {type: Two.Types.svg, width: sliceViewWidth, height: sliceViewHeight};


    //Path View Parameters.
    var pathViewWidth = $('#path-view').css('width');
    var pathViewHeight = $('#path-view').css('height');
    me.pathViewParams = { type: Two.Types.svg, width: pathViewWidth, height: pathViewHeight };

    SlicePartItem.prototype = Object.create(PartItem.prototype);
    SlicePartItem.prototype.constructor = SlicePartItem;
    PathPartItem.prototype = Object.create(PartItem.prototype);
    PathPartItem.prototype.constructor = PathPartItem;

    this.documentPartAddedSlot = function(){
        me.slicePartItem = new SlicePartItem(me.doc.part(), me.sliceViewParams);
        me.pathPartItem = new PathPartItem(me.doc.part(), me.sliceViewParams);
    };
    //this.mouseInit();

this.mouseInit = function(){
    var selfItem = this;
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
        foo(e,selfItem);
    };
    document.getElementById("slice-view").onmousemove=function(e){
        var foo = $.proxy(editMenu.ifMouseMoved,editMenu);
        foo(e,this);
    };
    document.getElementById("slice-view").onmouseover=function(e){
        var foo = $.proxy(editMenu.mouseHover,editMenu);
        foo(e,this);
    };
    document.getElementById("slice-view").onclick=function(e){
        var foo = $.proxy(editMenu.mouseAction,editMenu);
        foo(e,this);
    };
    document.getElementById("buttons").onclick=function(e){
        console.log(e.target.id);
        var foo = $.proxy(editMenu.ifMousePressed,editMenu);
        foo(e.target.id);
    };
};

this.update = function(key){
    if(key.action === 'zoom'){
        var newScale = this.sliceViewGroup.scale + key.val;
        if(newScale < 0.3){
            this.sliceViewGroup.scale = 0.3;
        }
        else if (newScale > 3){
            this.sliceViewGroup.scale = 3;
        }
        else {
            this.sliceViewGroup.scale = newScale;
        }
    }
    else if (key.action === 'move'){
        this.sliceViewGroup.translation.set(key.x, key.y);
    }
    else if (key.action === 'edit'){
        var helix = this.part.getHelix(key.val);
        var id;
        if(helix.isEvenParity()){
            id = this.part.getNextEvenHelixID();
        }
        else {
            id = this.part.getNextOddHelixID();
        }
        var foo = $.proxy(helix.select,helix);
        foo(id);

        // 

        // Path View update
        var pView = this.pathView;
        foo = $.proxy(pView.addHelix,pView);
        var pvHelix = foo(id);
    }
    else if (key.action === 'hover' && key.val){
        var helix = this.part.getHelix(key.val);
        if(helix){
            var foo = $.proxy(helix.hover,helix);
            foo();
        }
    }
    else if (key.action === 'nohover' && key.val){
        var helix = this.part.getHelix(key.val);
        if(helix){
            var foo = $.proxy(helix.nohover,helix);
            foo();
        }
    }

    // Don't forget to tell two to render everything
    // to the screen
    this.sliceViewTwo.update();
};

this.dispatch = function(key){
    console.log(this);
    this.started.dispatch(key);
};

this.init = function(){

    // Link signal handlers
    this.started.add($.proxy(this.update,this));
    // Make an instance of two and place it on the page.
    var sliceViewBox = document.getElementById('slice-view').children[0];
    this.sliceViewTwo.appendTo(sliceViewBox);
    this.part.createHoneyComb(this.sliceViewTwo);

    this.sliceViewGroup = this.sliceViewTwo.makeGroup(this.part.getHelices());
    this.sliceViewTwo.update();

    var pathViewBox = document.getElementById('path-view').children[0];
    this.pathViewTwo.appendTo(pathViewBox);
    this.pathViewGroup = this.pathViewTwo.makeGroup();
    this.pathView = new PathViewItem(this.pathViewTwo, this.pathViewGroup);
    this.pathViewTwo.update();

};
}
