/* VIEWS HERE */
function VirtualHelixItem(r,c){
    var me = this;
    me.row_ = r;
    me.col_ = c;
    me.isSelected_ = false;
    me.id_ = -1;

    me.setRowCol = function(r, c){
        me.row_ = r;
        me.col_ = c;
    };

    me.getPolygon = function(){
        return me.polygon_;
    };

    me.make = function(two,x,y,r){
        console.log(two);
        me.polygon_ = two.makeCircle(x,y,r);

        // The object returned has many stylable properties:
        me.polygon_.fill = '#D4D4D4';
        me.polygon_.stroke = 'black';
        me.polygon_.linewidth = 1;
        return me.polygon_;
    };

    me.hover = function(){
        console.log('eh there');
        if(me.isSelected_ === false){
            me.polygon_.linewidth = 3;
            me.polygon_.fill = '#5F7DF5';
            me.polygon_.stroke = '#1B39E0';
        }
    };

    me.nohover = function(){
        console.log('eh there bye');
        if(me.isSelected_ === false){
            me.polygon_.linewidth = 1;
            me.polygon_.fill = '#D4D4D4';
            me.polygon_.stroke = 'black';
        }
    };

    me.select = function(id){
        if(me.isSelected_ === false){
            me.polygon_.linewidth = 1;
            me.polygon_.fill = '#EB7A42';
            me.polygon_.stroke = '#D64C06';
            me.isSelected_ = true;
            me.id_ = id;
            console.log('new helix id = '+id);
        }
    };

    me.getSvgID = function(){
        return me.polygon_.id;
    };

    me.isEvenParity = function(){
        return ((me.row_ % 2) === (me.col_ % 2));
    }

    me.isOddParity = function(){
        return ((me.row_ % 2) ^ (me.col_ % 2));
    }

}
