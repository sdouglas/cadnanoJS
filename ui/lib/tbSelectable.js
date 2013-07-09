var tbSelectArray = new Array(); //an array to keep track of which boxes are checked
//default options: scaf, stap, endpoint, xover are checked
tbSelectArray[0] = true;
tbSelectArray[1] = true;
tbSelectArray[2] = false;
tbSelectArray[3] = true;
tbSelectArray[4] = true;
tbSelectArray[5] = false;
//this function is called when a checkbox is clicked
function tbArrayChange(n) {
    tbSelectArray[n] = !tbSelectArray[n];
    if(n===2 && tbSelectArray[2]) { //checking handler unchecks endpoint,xover,strand
	tbSelectArray[3] = false;
	document.getElementById("tb3").checked = false;
	tbSelectArray[4] = false;
	document.getElementById("tb4").checked = false;
	tbSelectArray[5] = false;
	document.getElementById("tb5").checked = false;
    }
    if(n===2 && !tbSelectArray[2]) { //cannot uncheck handler when none of endpoint,xover,strand is checked
	tbSelectArray[2] = true;
	document.getElementById("tb2").checked = true;
    }
    if((n===3 && tbSelectArray[3])||(n===4 && tbSelectArray[4])||(n===5 && tbSelectArray[5])) { //checking endpoint,xover,strand unchecks handler
	tbSelectArray[2] = false;
	document.getElementById("tb2").checked = false;
    }
    if((n===3||n===4||n===5) && (!tbSelectArray[3] && !tbSelectArray[4] && !tbSelectArray[5])) { //endpoint,xover,strand cannot be all unchecked
	tbSelectArray[n] = true;
	document.getElementById("tb"+n).checked = true;
    }
    if((n===0||n===1) && (!tbSelectArray[0] && !tbSelectArray[1])) { //scaf and stap cannot be both unchecked
	tbSelectArray[n] = true;
	document.getElementById("tb"+n).checked = true;
    }
}
