"use strict"

var express = require("express");
var bodyParser = require("body-parser");
var hogan = require("hogan");
var fs = require("fs");
var indexTmpl = hogan.compile(fs.readFileSync("./web-src/index.html", {encoding: "utf-8"}));
var Shohousen = require("myclinic-drawer-forms").Shohousen;
var moment = require("moment");

function render(req, res, data){
	var shohousen = new Shohousen();
	if( data["hakkou-kikan"] ){
		var hakkouKikan = data["hakkou-kikan"];
		shohousen.setHakkouKikan(hakkouKikan[0], hakkouKikan[1], hakkouKikan[2], hakkouKikan[3])
	}
	if( data["doctor"] ){
		shohousen.setDoctor(data["doctor"]);
	}
	if( data["koufu-date"] ){
		var koufuDate = data["koufu-date"];
		shohousen.setKoufuDate("" + koufuDate[0], "" + koufuDate[1], "" + koufuDate[2]);
	}
	if( data["hokensha-bangou"] ){
		shohousen.setHokenshaBangou("" + data["hokensha-bangou"]);
	}
	if( data["kubun-hihokensha"] ){
		shohousen.setKubunHihokensha();
	}
	if( data["kubun-hifuyousha"] ){
		shohousen.setKubunHifuyousha();
	}
	if( data["hihokensha"] ){
		shohousen.setHihokensha(data["hihokensha"]);
	}
	if( data["kouhi-1-futansha"] ){
		shohousen.setKouhi1Futansha("" + data["kouhi-1-futansha"]);
	}
	if( data["kouhi-1-jukyuusha"] ){
		shohousen.setKouhi1Jukyuusha("" + data["kouhi-1-jukyuusha"]);
	}
	if( data["kouhi-2-futansha"] ){
		shohousen.setKouhi2Futansha("" + data["kouhi-2-futansha"]);
	}
	if( data["kouhi-2-jukyuusha"] ){
		shohousen.setKouhi2Jukyuusha("" + data["kouhi-2-jukyuusha"]);
	}
	if( data["shimei"] ){
		shohousen.setShimei(data["shimei"]);
	}
	if( data["birthday"] ){
		var birthday = data["birthday"];
		shohousen.setBirthday("" + birthday[0], "" + birthday[1], "" + birthday[2]);
	}
	if( data["sex"] ){
		var sex = data["sex"].toUpperCase();
		if( sex === "M" ){
			shohousen.setSexMale();
		} else if( sex === "F" ){
			shohousen.setSexFemale();
		}
	}
	if( "futan-wari" in data ){
		shohousen.setFutanwari("" + data["futan-wari"]);
	}
	if( data["valid-upto"] ){
		var validUpto = data["valid-upto"];
		shohousen.setValidUptoDate("" + validUpto[0], "" + validUpto[1], "" + validUpto[2])
	}
	if( data["drugs"] ){
		shohousen.setDrugs(data["drugs"]);
	}
	var ops = shohousen.getOps();
	var drawerPage = JSON.stringify([ops]);
	var printManageUrl = "http://localhost:8082/";
	res.end(indexTmpl.render({
		drawerPage: drawerPage, 
		"print-manage-url": printManageUrl,
		base: req.baseUrl
	})); 
}

function createBaseData(config){
	var data = {};
	["hakkou-kikan", "doctor"].forEach(function(key){
		if( key in config ){
			data[key] = config[key];
		}
	})
	return data;
}

module.exports = function(config){ 
	var app = express();
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(bodyParser.json());
	app.post("/", function(req, res){
		var data = createBaseData(config);
		var postData;
		if( "json-data" in req.body ){
			postData = JSON.parse(req.body["json-data"]);
		} else {
			postData = req.body;
		}
		for(var key in postData ){
			data[key] = postData[key];
		}
		console.log("data", data);
		render(req, res, data);
	});
	app.get("/test", function(req, res){
		render(req, res, {
			"hakkou-kikan": [
	            "〒123-456 東京都無名区或無名1-23-45",
    	        "無名クリニック",
        	    "電話 03 (1234) 5678",
            	"1234567"
            ],
            doctor: "診療一郎",
            "koufu-date": [2016, 10, 12],
            "hokensha-bangou": 1234,
            "kubun-hihokensha": true,
            "kubun-hifuyousha": true,
            hihokensha: "記号・番号",
            "kouhi-1-futansha": 12345678,
            "kouhi-1-jukyuusha": 1234567,
            "kouhi-2-futansha": 23456789,
            "kouhi-2-jukyuusha": 2345678,
            shimei: "匿名太郎",
            "birthday": [1968, 10, 23],
            sex: "M",
            //sex: "F",
            "futan-wari": 3,
            "valid-upto": [2016, 10, 15],
            drugs: "Ｒｐ）\n１）．．．\n２）．．．"
		})
	})
	app.get("/", function(req, res){
		render(req, res, {});
	});
	app.use(express.static("static"));
	return app;
}