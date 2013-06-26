if(typeof Object.create !== 'function'){
    Object.create = function(obj){
        var tmpObj = function(){};
        tmpObj.prototype = obj.prototype;
        return new tmpObj();
    };
}

/* Every Handler Needs the following functions 
 * createCircle(x,y,radius)
 * setParams
 * render
 * init
 * addToDom
 */

function viewHandler(type){
    console.log(type);
    if(type === Constants.RendererTwo){
        return new viewHandlerTwo();
    }
    else if (type === Constants.RendererKinetic){
        return new viewHandlerKinetic();
    }
    else{
        console.log("Incorrect handler specified");
        return null;
    }
};
