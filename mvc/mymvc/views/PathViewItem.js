function PathViewItem(pathViewTwo, pathViewGroup){
    this.origamiDepth_ = 42;
    this.circleX = 20;
    this.circleY = 20;
    this.circleR = 12;
    this.distFromCircleToHelix = 20;
    this.baseWidthX = 8;
    this.helixWidthY = 2 * this.circleR;
    this.helixStartX = 40;
    this.helixStartY = this.circleY - this.circleR;
    this.currentHelices = {};
    this.pathViewRenderer_ = pathViewTwo;
    this.pathViewRendererGroup_ = pathViewGroup;
}

PathViewItem.prototype.addHelix = function(id){
    //Create 3 drawings.
    //1. Circle.
    //2. Horizontal Ladder.
    //3. redraw-path
    var pathViewTwo = this.pathViewRenderer_;
    var pathViewGroup = this.pathViewRendererGroup_;

    var helixIdentifier = pathViewTwo.makeCircle(
            this.circleX,
            this.circleY,
            this.circleR);
    helixIdentifier.fill = '#EB7A42';
    helixIdentifier.stroke = '#EB7A42';
    helixIdentifier.linewidth = 1;

    var rectX = this.circleX + this.circleR + this.distFromCircleToHelix;
    var rectY = this.circleY;
    var borderRect = pathViewTwo.makeRectangle(
            rectX + (this.origamiDepth_ * this.baseWidthX)/2,
            rectY,
            this.origamiDepth_ * this.baseWidthX, 
            this.helixWidthY);
    borderRect.linewidth = 2;
    
    console.log("rect params: " + rectX + 
        ", " + rectY +
        ", " + this.origamiDepth_ * this.baseWidthX +
        ", " + this.helixWidthY);

    pathViewGroup.add(helixIdentifier);
    pathViewGroup.add(borderRect);

    for(var i=0;i<this.origamiDepth_;i++){
        var baseLine = pathViewTwo.makeLine(
                rectX + i*this.baseWidthX,
                this.helixStartY,
                rectX + i*this.baseWidthX,
                this.helixStartY+this.helixWidthY
                );
        baseLine.linewidth = 1;
        if(i%7 === 0){
            baseLine.linewidth = 2;
        }
        pathViewGroup.add(baseLine);
    }
};
