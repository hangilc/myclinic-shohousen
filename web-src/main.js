"use strict";

var drawerToSvg = require("myclinic-drawer-svg").drawerToSvg;

var drawerPages = window.drawerPages;
var ops = drawerPages[0];
var dom = document.getElementById("preview-wrapper");
dom.appendChild(drawerToSvg(ops, {width: "148mm", height: "210mm", viewBox: "0 0 148 210"}));


