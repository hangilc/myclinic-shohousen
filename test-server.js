var app = require("express")();
var config = require("./test-config");
var shohousen = require("./index")(config);

app.use("/shohousen", shohousen);

var port = 8081;
app.listen(port, function(){
	console.log("server listening to " + 8081);
})
