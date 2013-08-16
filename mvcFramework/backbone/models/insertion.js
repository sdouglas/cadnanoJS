/**
 * Insertions do affect an applied sequence and do not store a sequence
 * themselves.  They are a skip if the length is less than 0.
 */
var Insertion = Backbone.Model.extend({
    initialize:
    function(){
        console.log('what the hell');
        this._length = this.get('length');
        this._index = this.get('index');
    },

    length:
    function(){
        return this._length;
    },

    setLength:
    function(len){
        this._length = len;
    },

    updateIdx:
    function(delta){
        this._index += delta;
    },
    
    idx:
    function(){
        return this._index;
    },
    
    isSkip:
    function(){
        return this.length() < 0;
    },
});
