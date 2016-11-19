var typeCheck = {}

typeCheck.isTypeNameValid = function(typeName){
	var types = ['any', 'string', 'number', 'boolean', 'date', 'array', 'object', 'smartobject', 'function'];
	if(types.indexOf(typeName.toLowerCase()) >= 0){
		return true
	}
	return false;
}

typeCheck.isFunction = function(arg){
	return (typeof arg === "function") ? true : false;
}


typeCheck.isArray = function(arg){
	return (typeof arg === "object" && Array.isArray(arg)) ? true : false;
}

typeCheck.isSmartObject = function(arg){
	if(typeof arg === "object" && ("__$$__isSmartObject" in arg || "__$$__Name" in arg)){
		return true;	
	}
	return false;
}

typeCheck.isObject = function(arg){
	return (typeof arg === "object" && !Array.isArray(arg) && !this.isSmartObject(arg)) ? true : false;
}
typeCheck.isAny = function(arg){
	return (typeof arg === "string" && (arg === "*" || arg === "Any".toLowerCase()) ) ? true : false;
}


module.exports = typeCheck;

/*
//if any, just assign it
				if (_objWithType[propsName] === "*" || _objWithType[propsName] === "Any".toLowerCase()){
					_objWithValue[propsName] = val;
				}
				//check if it is array
				else if (Array.isArray(val) && _objWithType[propsName] === "Array"){
					_objWithValue[propsName] = val;
				}

				//check if it is a SMARTOBJECT
				else if(typeof val === "object" && "__$$__isSmartObject" in val){
					var newName = `${_interfaceAPI["__$$__Name"].Name}.${propsName}`;
					val["__$$__Name"]["Name"] = newName
					_nestedSchema[propsName] = val;
					_objWithValue[propsName] = Object.assign({}, 
						{"__$$__Name": {Name: newName}},
						val.getSchema()
					);
					LinkPropsToNestedSchema(_objWithValue[propsName], _nestedSchema[propsName]);
				}

				//check if it is a function
				else if (typeof val === "function"){
					if(true){
						_objWithValue[propsName] = val;
					} else {
						errorMessage = `[${_interfaceAPI.__$$__Name.Name}.${propsName}] expected [${_objWithType[propsName]}] , but received a [${typeof val}]`;
					}
				}

				//check and must match the type of _objWithType
				else if(typeof val === _objWithType[propsName].toLowerCase()){
					_objWithValue[propsName] = val;
				} 
				else {
					errorMessage = `[${_interfaceAPI.__$$__Name.Name}.${propsName}] expected [${_objWithType[propsName]}] , but received a [${typeof val}]`;
					throw new TypeError(errorMessage)
				}*/