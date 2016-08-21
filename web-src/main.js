"use strict";

var $ = require("jquery");
var drawerToSvg = require("myclinic-drawer").drawerToSvg;

var drawerPages = window.drawerPages;
var ops = drawerPages[0];
var dom = $("#preview-wrapper");
dom.html("").append(drawerToSvg(ops, {width: "148mm", height: "210mm", viewBox: "0 0 148 210"}));