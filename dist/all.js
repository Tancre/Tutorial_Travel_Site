alert('test for webpack');

var Person = require('./modules/Person');

var john = new Person("John Doe", "blue");
john.greet();

var jane = new Person("Jane Smith", "green");
jane.greet();  
function Person(fullName, favColor) {
	this.name = fullName;
	this.favoriteColor = favColor;
	this.greet = function() {
		console.log("Hello my name is " + this.name + ' and my favorite color is ' + this.favoriteColor);
	}
}

module.exports = Person;