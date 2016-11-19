"use strict";

var SmartObject = require("./SmartObject"); // import

var schema = {
	leg: Number,
	name: String,
	isAlive:Boolean,
	createdAt: Date,
	children: "*",
	addLeg: (name___String, leg___object) => {}
};



var Animal = SmartObject("Animal", schema); //error Logging;


Animal.leg = 4;
Animal.name = "michael";
Animal.isAlive = true;
Animal.addLeg = (name, leg) => {
	Animal.name = name; //michele 
	Animal.leg+=1; //5
	console.log("log", this)
	
}
Animal.addLeg("michele", {});
Animal.logValue();