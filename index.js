"use strict"

var express = require("express");
var service = require("./service");
var bodyParser = require("body-parser");
var hogan = require("hogan");
var fs = require("fs");
var indexTmpl = hogan.compile(fs.readFileSync("./web-src/index.html", {encoding: "utf-8"}));
var Shohousen = require("myclinic-drawer-forms").Shohousen;

module.exports = function(config){
	var app = express();
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(bodyParser.json());
	app.use(express.static("static"));
	app.use("/", function(req, res){
		var shohousen = new Shohousen();
		var ops = shohousen.getOps();
		var drawerPage = JSON.stringify([ops]);
		res.end(indexTmpl.render({drawerPage: drawerPage}));
	})
	return app;
}