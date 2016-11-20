var SO = require("./SmartObject")

var schema = {
	leg: Number,
	addLeg: (leg___number) => undefined
}

var Cat = SO("Cat", schema);
Cat.addLeg = function(leg) {
	this.leg = 5; 
}
Cat.addSchema({test: Boolean})
Cat.addLeg(4)
Cat.logValue();

