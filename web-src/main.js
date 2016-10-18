"use strict";

var hogan = require("hogan.js");
var settingsTmplSrc = require("raw!./list-printer-settings.html");
var settingsTmpl = hogan.compile(settingsTmplSrc);

var drawerToSvg = require("myclinic-drawer-svg").drawerToSvg;

var drawerPages = window.drawerPages;
var ops = drawerPages[0];
var dom = document.getElementById("preview-wrapper");
dom.appendChild(drawerToSvg(ops, {width: "148mm", height: "210mm", viewBox: "0 0 148 210"}));

var printButtonId = "printButton";
var selectedSettingId = "selectedSetting";
var chooseSettingId = "chooseSetting";
var settingWorkArea = "settingWorkArea";

var printServerHost = "localhost";
var printServerPort = window.printServerPort;
var printerSettingLocalStorageKey = "ShohousenPrinterSetting";

function getSelectedSetting(){
	var setting = window.localStorage.getItem(printerSettingLocalStorageKey);
	return setting;
}

function removeSelectedSetting(){
	window.localStorage.removeItem(printerSettingLocalStorageKey);
}

function setSelectedSetting(name){
	window.localStorage.setItem(printerSettingLocalStorageKey, name);
}

function printServerUrl(){
	return location.protocol + "//" + printServerHost + ":" + printServerPort;
}

function updateSelectedSetting(){
	var e = document.getElementById(selectedSettingId);
	var setting = getSelectedSetting() || "(印刷設定なし)";
	e.innerHTML = "";
	e.appendChild(document.createTextNode(setting));
}

function bindPrint(button){
	button.addEventListener("click", function(event){
		var pages = drawerPages;
		var setting = getSelectedSetting();
		var port = printServerPort;
		fetch(printServerUrl() + "/print", {
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

function bindChooseSetting(e){
	e.addEventListener("click", function(event){
		event.preventDefault();
		fetch(printServerUrl() + "/setting", {
			mode: "cors",
			cache: "no-cache"
		})
		.then(function(response){
			if( !response.ok ){
				response.text().then(function(msg){
					alert("印刷エラー：" + msg);
				})
			}
			response.json().then(function(result){
				var currentSetting = getSelectedSetting();
				var list = result.map(function(item){
					return {
						name: item,
						checked: item === currentSetting
					};
				});
				var html = settingsTmpl.render({list: list, nosetting: !currentSetting});
				document.getElementById(settingWorkArea).innerHTML = html;
			})
		})
		.catch(function(error){
			alert("印刷エラー：" + error.message);
		})
	})
}

function bindWorkArea(e){
	e.addEventListener("click", function(event){
		var target = event.target;
		if( target.classList.contains("cancel") ){
			e.innerHTML = "";
		} else if( target.tagName === "INPUT" && target.getAttribute("type") === "radio" ) {
			var value = target.getAttribute("value");
			if( value === "" ){
				removeSelectedSetting();
			} else {
				setSelectedSetting(value);
			}
			updateSelectedSetting();
			e.innerHTML = "";
		}
	})
}

updateSelectedSetting();
bindPrint(document.getElementById(printButtonId));
bindChooseSetting(document.getElementById(chooseSettingId));
bindWorkArea(document.getElementById(settingWorkArea));

