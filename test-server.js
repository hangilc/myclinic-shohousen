var express = require("express");
var bodyParser = require("body-parser");
var shohousen = require("./index");
var config = require("./sample-config/shohousen-config");

var app = express();
var subApp = express();
subApp.use(bodyParser.urlencoded({extended: false}));
subApp.use(bodyParser.json());
shohousen.initApp(subApp, config);
subApp.use(express.static(shohousen.staticDir));
app.use("/shohousen", subApp);

var port = 8081;
app.listen(port, function(){
	console.log("server listening to " + 8081);
})
