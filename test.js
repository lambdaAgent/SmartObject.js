var anotherFunction = function(str, num){
	console.log(typeof str, typeof num)
}

var test = function(){
	anotherFunction.apply(null, arguments)
}

test("hello", 0);