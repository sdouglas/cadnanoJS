function encode(doc){
    //get the set of helix items from the doc.
    var part = doc.part();
    var vhSet = part.getVHSet();
    var numBases = part.maxBaseIdx() + 1;

    /** 
     * add each virtual helix to the json
     * object.  //row //col //num //scaf //stap //loop //skip //stap_colors.
     */
    var vhList = new Array();
    vhSet.each(function(vh){
        var vhDict = { 
            row: vh.getRow(),
            col: vh.getCol(),
            num: vh.hID,
            scaf: vh.scafStrandSet.getLegacyArray(),
            stap: vh.stapStrandSet.getLegacyArray(),
            loop: [],
            skip: [],
            stap_colors: [],
        };
        vhList.push(vhDict);
    });
    var obj = {
        name: 'temp.json', 
        vstrands: vhList,
    };
    return JSON.stringify(obj);
};
