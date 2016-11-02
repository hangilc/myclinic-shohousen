var express = require("express");
var bodyParser = require("body-parser");
var shohousen = require("./index");
var Printer = require("myclinic-drawer-print-server");
var config = require("./sample-config/shohousen-config");

var app = express();
var subApp = express();
subApp.use(bodyParser.urlencoded({extended: false}));
subApp.use(bodyParser.json());
shohousen.initApp(subApp, config);
subApp.use(express.static(shohousen.staticDir));
app.use("/shohousen", subApp);

var printerApp = express();
printerApp.use(bodyParser.urlencoded({extended: false}));
printerApp.use(bodyParser.json());
Printer.initApp(printerApp, {});
printerApp.use(express.static(Printer.staticDir));
app.use("/printer", printerApp);

var port = 8081;
app.listen(port, function(){
	console.log("server listening to " + 8081);
})
