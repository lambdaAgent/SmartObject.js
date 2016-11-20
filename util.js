"use strict";
var typeCheck = require("./typeCheck")


var util = {};
util.convertSmartSchemaToObject = function(smartObject){
	var tempObj = smartObject.__$$__getType();
	Object.keys(tempObj).map(key => {
		//if any of the child is smartObject then recursively run convertSmartSchema
		if(typeCheck.isSmartObject(tempObj[key])){
			tempObj[key] = this.convertSmartSchemaToObject(tempObj[key])
		}
	});
	return tempObj;
}
util.convertSmartObjectToObject = function(smartObject){
	var tempObj = smartObject.__$$__getValue();
	Object.keys(tempObj).map(key => {
		//if any of the child is smartObject then recursively run convertSmartObject
		if(typeCheck.isSmartObject(tempObj[key])){
			tempObj[key] = this.convertSmartObjectToObject(tempObj[key])
		}
	});
	return tempObj;
}


util.logValue = function(){
	var args = [].slice.apply(arguments);
	var newArgs = args.map(obj => {
		if( typeCheck.isSmartObject(obj) ){
			var tempObj = this.convertSmartObjectToObject(obj);
		} 
		else {
			return obj;
		}

	});

	console.log.apply(null, newArgs)
}


util.logType = function(){
	var args = [].slice.apply(arguments);
	var newArgs = args.map(obj => {
		if( typeCheck.isSmartObject(obj) ){
			return this.convertSmartSchemaToObject(obj);
		} else {
			return obj;
		}

	});

	console.log.apply(null, newArgs)
}
util.typeof = function( obj ) {
  return ({}).toString.call( obj ).match(/\s(\w+)/)[1].toLowerCase();
}


util.checkTypesOfArguments = function( args, types, functionName ) {
  args = [].slice.call( args );
  for ( var i = 0; i < types.length; ++i ) {
    if ( util.typeof( args[i] ) != types[i].toLowerCase() ) {
      throw new TypeError( `[${functionName}] ` + 'param '+ i +' must be of type '+ types[i] );
    }

  }

};

util.checkForNumberArgumentsError = function(argumentsAssignment, argumentsType, name){
	var errorMessage = `[${name}] ` + "expected " +argumentsAssignment.length+" number of arguments, but get "+argumentsType.length+ " arguments instead.";
	if(argumentsAssignment.length !== argumentsType.length){
		throw new Error(errorMessage);	
	}
}




module.exports = util;



