"use strict";

var drawerToSvg = require("myclinic-drawer-svg").drawerToSvg;

var drawerPages = window.drawerPages;
var ops = drawerPages[0];
var dom = document.getElementById("preview-wrapper");
dom.appendChild(drawerToSvg(ops, {width: "148mm", height: "210mm", viewBox: "0 0 148 210"}));

var printButtonId = "printButton";

bindPrint(document.getElementById(printButtonId));

var printServerHost = "localhost";
var printServerPort = 8082;

function bindPrint(button){
	button.addEventListener("click", function(event){
		var pages = drawerPages;
		var setting = "preview2";
		var port = printServerPort;
		fetch(location.protocol + "//" + printServerHost + ":" + printServerPort + "/print", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				pages: pages,
				setting: setting
			}),
			mode: "cors",
			cache: "no-cache"
		})
		.then(function(response){
			if( !response.ok ){
				response.text().then(function(msg){
					alert("印刷エラー：" + msg);
				})
			}
		})
		.catch(function(error){
			alert("印刷エラー：" + error.message);
		})
	})
}

