DocumentItem = function(){
    //Slice View Parameters.
    var sliceViewWidth = $('#slice-view').css('width');
    var sliceViewHeight = $('#slice-view').css('height');
    this.sliceViewParams_ = { type: Two.Types.svg, width: sliceViewWidth, height: sliceViewHeight };
    this.sliceViewTwo_ = new Two(this.sliceViewParams_);
    this.started_ = new signals.Signal();
    this.part_ = new PartItem();

    //Path View Parameters.
    var pathViewWidth = $('#path-view').css('width');
    var pathViewHeight = $('#path-view').css('height');
    this.pathViewParams_ = { type: Two.Types.svg, width: pathViewWidth, height: pathViewHeight };
    this.pathViewTwo_ = new Two(this.sliceViewParams_);
}

DocumentItem.prototype.update = function(key){
    if(key.action === 'zoom'){
        var newScale = this.sliceViewGroup_.scale + key.val;
        if(newScale < 0.3){
            this.sliceViewGroup_.scale = 0.3;
        }
        else if (newScale > 3){
            this.sliceViewGroup_.scale = 3;
        }
        else {
            this.sliceViewGroup_.scale = newScale;
        }
    }
    else if (key.action === 'move'){
        this.sliceViewGroup_.translation.set(key.x, key.y);
    }
    else if (key.action === 'edit'){
        var helix = this.part_.getHelix(key.val);
        var id;
        if(helix.isEvenParity()){
            id = this.part_.getNextEvenHelixID();
        }
        else {
            id = this.part_.getNextOddHelixID();
        }
        var foo = $.proxy(helix.select,helix);
        foo(id);

        // 

        // Path View update
        var pView = this.pathView_;
        foo = $.proxy(pView.addHelix,pView);
        var pvHelix = foo(id);
    }
    else if (key.action === 'hover' && key.val){
        var helix = this.part_.getHelix(key.val);
        if(helix){
            var foo = $.proxy(helix.hover,helix);
            foo();
        }
    }
    else if (key.action === 'nohover' && key.val){
        var helix = this.part_.getHelix(key.val);
        if(helix){
            var foo = $.proxy(helix.nohover,helix);
            foo();
        }
    }

    // Don't forget to tell two to render everything
    // to the screen
    this.sliceViewTwo_.update();
};

DocumentItem.prototype.dispatch = function(key){
    console.log(this);
    this.started_.dispatch(key);
};

DocumentItem.prototype.init = function(){

    // Link signal handlers
    this.started_.add($.proxy(this.update,this));
    // Make an instance of two and place it on the page.
    var sliceViewBox = document.getElementById('slice-view').children[0];
    this.sliceViewTwo_.appendTo(sliceViewBox);
    this.part_.createHoneyComb(this.sliceViewTwo_);

    this.sliceViewGroup_ = this.sliceViewTwo_.makeGroup(this.part_.getHelices());
    this.sliceViewTwo_.update();

    var pathViewBox = document.getElementById('path-view').children[0];
    this.pathViewTwo_.appendTo(pathViewBox);
    this.pathViewGroup_ = this.pathViewTwo_.makeGroup();
    this.pathView_ = new PathViewItem(this.pathViewTwo_, this.pathViewGroup_);
    this.pathViewTwo_.update();

};
