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

function applyDbData(data, dbData){
	var patient = dbData.patient;
	if( patient ){
		var lastName = patient.last_name || "";
		var firstName = patient.first_name || "";
		if( lastName || firstName ){
			data.shimei = lastName + firstName;
		}
		if( patient.birth_day && patient.birth_day !== "0000-00-00" ){
			var birthday = moment(patient.birth_day);
			if( birthday.isValid() ){
				data.birthday = [birthday.year(), birthday.month()+1, birthday.date()];
			}
		}
		if( patient.sex === "M" || patient.sex === "F" ){
			data.sex = patient.sex;
		}
	}
	var visit = dbData.visit;
	if( visit ){
		var shahokokuho = visit.shahokokuho;
		if( shahokokuho ){
			data["hokensha-bangou"] = "" + shahokokuho.hokensha_bangou;
			data.hihokensha = [shahokokuho.hihokensha_kigou || "", shahokokuho.hihokensha_bangou || ""].join(" ・ ");
			if( 0 === +shahokokuho.honnin ){
				data["kubun-hifuyousha"] = true;
			} else if( 1 === +shahokokuho.honnin ){
				data["kubun-hihokensha"] = true;
			}
		}
		var koukikourei = visit.koukikourei;
		if( koukikourei ){
			data["hokensha-bangou"] = "" + koukikourei.hokensha_bangou;
			data["hihokensha"] = "" + koukikourei.hihokensha_bangou;
		}
		var kouhi_list = visit.kouhi_list || [];
		if( kouhi_list.length > 0 ){
			data["kouhi-1-futansha"] = kouhi_list[0].futansha;
			data["kouhi-1-jukyuusha"] = kouhi_list[0].jukyuusha;
		}
		if( kouhi_list.length > 1 ){
			data["kouhi-2-futansha"] = kouhi_list[1].futansha;
			data["kouhi-2-jukyuusha"] = kouhi_list[1].jukyuusha;
		}
		var at = moment(visit.v_datetime);
		data["koufu-date"] = [at.year(), at.month()+1, at.date()];
	}
	["drugs", "futan-wari"].forEach(function(key){
		data[key] = dbData[key];
	})
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
	app.get("/test/from-db-data", function(req, res){
		var data = createBaseData(config);
		applyDbData(data, {
			patient: {
				last_name: "匿名",
				first_name: "太郎",
				birth_day: "1968-10-23",
				sex: "M"
			},
			visit: {
				// shahokokuho: {
				// 	hokensha_bangou: "87654321",
				// 	hihokensha_kigou: "記号",
				// 	hihokensha_bangou: "番号",
				// 	honnin: 1
				// },
				koukikourei: {
					hokensha_bangou: 123456,
					hihokensha_bangou: 4321
				},
				kouhi_list: [
					{
						futansha: 12345678,
						jukyuusha: 1234567
					},
					{
						futansha: 23456789,
						jukyuusha: 2345678
					},
				],
				v_datetime: "2016-10-12"
			},
            drugs: "Ｒｐ）\n１）．．．\n２）．．．",
            "futan-wari": 3
		});
		render(req, res, data);
	});
	app.post("/from-db-data", function(req, res){
		var data = createBaseData(config);
		applyDbData(data, req.body);
		render(req, res, data);
	});
	app.post("/", function(req, res){
		var data = createBaseData(config);
		for(var key in req.body ){
			data[key] = req.body[key];
		}
		render(req, res, req.body);
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