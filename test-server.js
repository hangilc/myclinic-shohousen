var app = require("express")();
var shohousen = require("./index");

var config = {
	"hakkou-kikan": [
        "〒123-456 東京都無名区或無名1-23-45",
        "無名クリニック",
	    "電話 03 (1234) 5678",
    	"1234567"
    ],
    "doctor": "診療一郎"
};

app.use("/shohousen", shohousen(config));

var port = 8081;
app.listen(port, function(){
	console.log("server listening to " + 8081);
})
