var typeCheck = require("./typeCheck");
var util = require("./util");

function SmartObject(SchemaName, obj){
	if(!SchemaName || typeof SchemaName !== "string" || SchemaName == ""){
		throw new Error("SmartObject must have a name and of type [String]")
	}
	
	var _objWithType = createObjectWithType(obj);
	var _objWithValue = createObjectWithValue(_objWithType);
	var _nestedSchema = {}; 

	var _interfaceAPI = { 
		logType: () => console.log( `${SchemaName}:TYPE = `,_objWithType ), //console.log( _objWithType );
		logValue:() => console.log( `${SchemaName}:VALUE = `, _objWithValue ), //console.log( _objWithValue );
        
        flatten: () => util.convertSmartObjectToObject(_interfaceAPI),
        schema: () => util.convertSmartSchemaToObject(_interfaceAPI),

        setProps(args1, args2){ 
        	//set the value of SmartObject
			//accept an object or 2string ("props","value")
        	if(typeof args1 === "string" && args2){
        		_interfaceAPI[args1] = args2
        	} else if (typeof args1 === "object"){
        		var keys = Object.keys(args1);
        		keys.map(k => {
        			_interfaceAPI[k] = args1[k];
        		});  
        	}
        }, 
        addSchema(newSchema){ 
        	//add extra schema on top of original schema
        	//since _interfaceAPI is frozen, need to do cloning, and freeze the newClone 
			//accept an object or 2string ("props","value")
			
			if(typeof newSchema !== "object" || Array.isArray(true)){
				throw new TypeError("addProps only accept an object Schema")
        	}
    	
    		var _newObjWithType = createObjectWithType(newSchema);
    		_objWithType = Object.assign({}, _objWithType, _newObjWithType);
    		// _objWithValue = createObjectWithValue(_objWithType);

        },
        removeProp: removeProps,
        __$$__getValue: () => _objWithValue, //return _objWithValue
        __$$__getType: () => _objWithType,
   		__$$__Name: {Name: SchemaName},
   		__$$__isSmartObject:true,
	};
	_interfaceAPI = Object.assign({}, _interfaceAPI, _objWithType)
	attachGetterSetter(_interfaceAPI, _objWithType, _objWithValue, _nestedSchema);

	//freeze the interface
	return Object.freeze(_interfaceAPI);
}



module.exports = SmartObject;


// =============
//    HELPER
// =============



function flatten(_objWithValue){
	var props = Object.keys(_objWithValue);
	var result = {}
	props.map(key => {
		if(typeCheck.checkSmartObject(_objWithValue[key])){
			//if its' smart Object
			result[key] = {};
			result[key] = util.convertSmartObjectToObject(_objWithValue[key]);
		} else {
			result[key] = _objWithValue[key];
		}
	});
	return result;
}

function addProps(){}
function removeProps(){}

function findFunctionBodyFromString(str){
	//thre are several way to include function
	//1. fn: () => {}
	//2. fn() { }
	//3. fn: function{}
	//4. fn: () => 
	//1 - 3 has curly, find first curly, find last curly
	//4, check if it has arrow and no curly.
	var openCurly = str.indexOf("{");
	var closeCurly = findLastCurly(str);
	var body = str.slice(openCurly+1, closeCurly);
	var fatArrow = str.indexOf("=>");
	if(fatArrow >= 0 && openCurly === -1){
		//if has arrow and no curly
		body = "return " + str.slice(fatArrow+2);
	}

	return body;
}

function findLastCurly(str){
	var lastFoundCurly = -1;

	function findCloseCurly(str, startIndex){
		if(str.indexOf("}") === -1){
			return lastFoundCurly;
		}

		lastFoundCurly = str.indexOf("}");
	}

	findCloseCurly(str, 0);
	return lastFoundCurly
}

function createObjectWithValue(_objWithType){
	var result = {};
	Object.keys(_objWithType).map(k => {
		if(_objWithType[k].indexOf("[Function]:") !== -1){
			//if "[function]:" exists;
			// attempt to initiate function immediately;
				// var openBracket = _objWithType[k].indexOf("(");
				// var closeBracket = _objWithType[k].indexOf(")");
				// var args = _objWithType[k].slice(openBracket+1, closeBracket).split(",");
				// args = args.map(el => el.split("___")[0]);
				// var body = findFunctionBodyFromString(_objWithType[k]);
				// var fn =  Function.call(null, ...args, body );
				// result[k] = fn;
			return result[k] = new Function();
		}
		switch(_objWithType[k].toLowerCase()){
			case "string":
				result[k] = "";	break;
			case "number":
				result[k] = 0; break;
			case "boolean":
				result[k] = false; break;
			case "*": 
			case "any":			
				result[k] = "any"; break;
			case "date":
				result[k] = new Date(); break;
			case "array":
			case "Array":
				result[k] = []; break;
			case "object":
				result[k] = {}; break;
			case "smartobject":
				result[k] = {};	break;
		}
	});
	return result;
}

function createObjectWithType(obj){
	var result = {};
	Object.keys(obj).map(k => {
		if(typeof obj[k] === "function" && obj[k].name){  //if obj[k] is function with name
			//check if typeName is valid , that is one of 9 types ['any', 'string', 'number', 'boolean', 'date', 'array', 'object', 'smartobject', ' function']
			if(typeCheck.isTypeNameValid(obj[k].name)){
				result[k] = obj[k].name.toLowerCase();
			} else {
				//if type is function but the name of function is not one of 9
				result[k] = "[Function]: " + obj[k];
			}
		}
		else if (typeof obj[k] == "function"){
			//check if tripleunderscore exists
			//check if type is valid, one of 9 ['any', 'string', 'number', 'boolean', 'date', 'array', 'object', 'smartobject', 'function']
			// console.log("value", obj[k])
			result[k] = "[Function]: " + obj[k];
		} else if (typeof obj[k] === "string" && typeCheck.isAny(obj[k])){
			result[k] = "any";
		} else if(typeof obj[k] === "string" && typeCheck.isTypeNameValid(obj[k])){
			result[k] = obj[k].toLowerCase();
		}else {
			var errorMessage = `${obj[k]} is not a validType`
			throw new TypeError(errorMessage)
		}
	})
	return result;
}

function LinkPropsToNestedSchema(parentProps, smartObject ){
	Object.keys(parentProps).map(key => {
		Object.defineProperty(parentProps, key, {
			set(val){
				//set: parentProps[key] = ""
				//pass this set function to smartObject
				smartObject[key] = val;
			},
			get(){
				//get: parentProps[key];
				return smartObject[key]
			}
		});
	});
}


function attachGetterSetter(_interfaceAPI, _objWithType, _objWithValue, _nestedSchema){
	var errorMessage = "";
	Object.keys(_objWithType).map(propsName => {
		Object.defineProperty(_interfaceAPI, propsName, {
			set(val){
				//if any, just assign it
				if (_objWithType[propsName] === "*" || _objWithType[propsName] === "Any".toLowerCase()){
					_objWithValue[propsName] = val;
				}

				//check if it is array
				else if (_objWithType[propsName] === "array" && typeCheck.isArray(val)){
					_objWithValue[propsName] = val;
				}

				//if type is object, reject Array, Function, and SmartObject
				//Array, Function, and SmartObject are actually an object in javascript, so manuall checking is needed
				else if(_objWithType[propsName] === "Object"){
					if(typeCheck.isArray(val) ){
						errorMessage = `[${_interfaceAPI.__$$__Name.Name}.${propsName}] expected [${_objWithType[propsName]}] , but received a [Array]`;
						throw new TypeError(errorMessage)
					} else if (typeCheck.isSmartObject(val)){
						errorMessage = `[${_interfaceAPI.__$$__Name.Name}.${propsName}] expected [${_objWithType[propsName]}] , but received a [SmartObject]`;
						throw new TypeError(errorMessage);
					} else if(typeCheck.isFunction(val)){
						errorMessage = `[${_interfaceAPI.__$$__Name.Name}.${propsName}] expected [${_objWithType[propsName]}] , but received a [Function]`;
						throw new TypeError(errorMessage);					
					} 
					else if(typeof val === "object"){
						_objWithValue[propsName] = val;
					} 
				}

				//check if it is a SMARTOBJECT
				else if(_objWithType[propsName] === "smartobject" && typeCheck.isSmartObject(val)){
					var newName = `${_interfaceAPI["__$$__Name"].Name}.${propsName}`;
					val["__$$__Name"]["Name"] = newName
					_nestedSchema[propsName] = val;
					_objWithValue[propsName] = Object.assign({}, 
						{
							"__$$__Name": {Name: newName},
							getValue: () => {},
							getSchema: () => {},
							flatten: () => {},
							getSchema: () => {}
						},
						val.schema()
					);
					LinkPropsToNestedSchema(_objWithValue[propsName], _nestedSchema[propsName]);
				}

				//check if it is an empty function
				else if (_objWithType[propsName].indexOf("Function") === 0){
					if(typeof val === "function"){
						_objWithValue[propsName] = val;
					} else {
						errorMessage = `[${_interfaceAPI.__$$__Name.Name}.${propsName}] expected [${_objWithType[propsName]}] , but received a [${typeof val}]`;
						throw new TypeError(errorMessage);
					}
				}

				//if type is function declaration or function with body
				else if (_objWithType[propsName].indexOf("Function") > 0){
					
					// errorMessage = `[${_interfaceAPI.__$$__Name.Name}.${propsName}] expected [${_objWithType[propsName]}] , but received a [${typeof val}] with wrong arguments Type`;
					//extends function with util.checkTypes(arguments, [arrayOfArgsTypes])
					var functionName = _interfaceAPI.__$$__Name.Name+"."+propsName;
					var newFunction = extendsFunctionWithArgumentsTypeChecking(val, _objWithType[propsName], functionName);
					_objWithValue[propsName] = newFunction.bind(_interfaceAPI);
					
				}

				//check and must match the type of _objWithType
				else if(_objWithType[propsName].toLowerCase() === typeof val){
					_objWithValue[propsName] = val;
				} 
				else {
					errorMessage = `[${_interfaceAPI.__$$__Name.Name}.${propsName}] expected [${_objWithType[propsName]}] , but received a [${typeof val}]`;
					throw new TypeError(errorMessage)
				}
			},
			get(){
				if(typeof _objWithValue[propsName] === "object" && "__$$__Name" in _objWithValue[propsName]){
					return _objWithValue[propsName];
				}
				return _objWithValue[propsName];
			}
		});
	})
};



// To make obj fully immutable, freeze each object in obj.
// To do so, we use this function.
function deepFreeze(obj) {

  // Retrieve the property names defined on obj
  var propNames = Object.getOwnPropertyNames(obj);

  // Freeze properties before freezing self
  propNames.forEach(function(name) {
    var prop = obj[name];

    // Freeze prop if it is an object
    if (typeof prop == 'object' && prop !== null)
      deepFreeze(prop);
  });

  // Freeze self (no-op if already frozen)
  return Object.freeze(obj);
}


function cloneObject(object){
	return JSON.parse(JSON.stringify(object));
}



// ======================
//    ArgumentsChecker
// ======================

function extendsFunctionWithArgumentsTypeChecking(originalFunction, functionExpressionAsString, functionName){
	var argsOriginalFunction = (function(){
		var openBracket = originalFunction.toString().indexOf("(");
		var closeBracket = originalFunction.toString().indexOf(")");
		var argumentsString = originalFunction.toString().slice(openBracket+1,closeBracket).trim().split(",")
		return argumentsString;
	}());
	var functionAsType = functionExpressionAsString;
	var argsType = (function(){
		var openBracket = functionAsType.indexOf("(");
		var closeBracket = functionAsType.indexOf(")");
		var argumentsString = functionAsType.slice(openBracket+1,closeBracket).trim().split(",");
		return argumentsString.map(el => el.split("___")[1]);
	}())
	return function(){
		//IMPORTANT : "this" will be bound to _interfaceAPI; line216;
		//check if number of argumentsProvided match with argumentsTypes
		util.checkForNumberArgumentsError(argsType, arguments, functionName);
		util.checkTypesOfArguments(arguments, argsType, functionName);

		originalFunction.apply(this,arguments);
	}
}