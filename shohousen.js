"use strict";

function parseQuery(){
	var q = location.search;
	q = q.replace(/^\?/, "");
	var parts = q.split("&");
	var dict = {};
	parts.forEach(function(part){
		var toks = part.split("=");
		var key = toks[0], val = toks[1];
		dict[key] = parseValue(val);
	});
	return dict;
	
	function parseValue(val){
		var n = Number(val);
		if( !isNaN(n) ){
			return n;
		}
		return val;
	}
}

var query = parseQuery();
var patientId = query.patient_id || 0;
var textId = query.text_id || 0;
var gOps;

$.ajax({
	url: "/service?_q=shohousen_ops",
	data: {patient_id: patientId, text_id: textId},
	dataType: "json",
	success: function(result){
		var ops = result.ops;
		var svg = drawerToSvg(ops, {width: "148mm", height: "210mm", viewBox: "0 0 148 210"});
		var wrapper = $("#preview-wrapper");
		wrapper.html("").append(svg);
		gOps = ops;
	}
});

$("#printButton").click(function(){
	var opt = {
		url: "http://localhost:9006/print",
		type: "POST",
	};
	var data = {pages: [gOps]};
	var setting = $("#selectPrinter option:selected").val();
	if( setting ){
		data.setting = setting;
	}
	opt.data = JSON.stringify(data);
	$.ajax(opt);
});

function updatePrintersList(cb){
	var select = $("#selectPrinter");
	select.find("option:not(:first)").remove();
	$.ajax({
		url: "http://localhost:9006/list-settings",
		dataType: "json",
		success: function(list){
			list.forEach(function(name){
				var opt = $("<option></option>");
				opt.text(name);
				opt.val(name);
				select.append(opt);
			});
			if( cb ){
				cb();
			}
		}
	});
}

updatePrintersList(function(){
	var setting = localStorage.getItem("shohousen-printer-setting") || "";
	$("#selectPrinter option").each(function(){
		var opt = $(this);
		if( opt.val() === setting ){
			opt.prop("selected", true);
		}
	})
});

$("#managePrinterButton").click(function(){
	window.location.href="http://localhost:9006/manage.html";
});

$("#selectPrinter").change(function(){
	var setting = $("#selectPrinter option:selected").val();
	localStorage.setItem("shohousen-printer-setting", setting);
});