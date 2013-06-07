/* VIEWS HERE */
function VirtualHelixItem(r,c){
    this.row_ = r;
    this.col_ = c;
    this.isSelected_ = false;
    this.id_ = -1;
}

VirtualHelixItem.prototype.setRowCol = function(r, c){
    this.row_ = r;
    this.col_ = c;
};

VirtualHelixItem.prototype.getPolygon = function(){
    return this.polygon_;
};

VirtualHelixItem.prototype.make = function(two,x,y,r){
    this.polygon_ = two.makeCircle(x,y,r);

    // The object returned has many stylable properties:
    this.polygon_.fill = '#D4D4D4';
    this.polygon_.stroke = 'black';
    this.polygon_.linewidth = 1;
    return this.polygon_;
};

VirtualHelixItem.prototype.hover = function(){
    console.log('eh there');
    if(this.isSelected_ === false){
        this.polygon_.linewidth = 3;
        this.polygon_.fill = '#5F7DF5';
        this.polygon_.stroke = '#1B39E0';
    }
};

VirtualHelixItem.prototype.nohover = function(){
    console.log('eh there bye');
    if(this.isSelected_ === false){
        this.polygon_.linewidth = 1;
        this.polygon_.fill = '#D4D4D4';
        this.polygon_.stroke = 'black';
    }
};

VirtualHelixItem.prototype.select = function(id){
    if(this.isSelected_ === false){
        this.polygon_.linewidth = 1;
        this.polygon_.fill = '#EB7A42';
        this.polygon_.stroke = '#D64C06';
        this.isSelected_ = true;
        this.id_ = id;
        console.log('new helix id = '+id);
    }
};

VirtualHelixItem.prototype.getSvgID = function(){
    return this.polygon_.id;
};

VirtualHelixItem.prototype.isEvenParity = function(){
    return ((this.row_ % 2) === (this.col_ % 2));
}

VirtualHelixItem.prototype.isOddParity = function(){
    return ((this.row_ % 2) ^ (this.col_ % 2));
}
