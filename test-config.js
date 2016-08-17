module.exports = {
	dbConfig: {
		host: "127.0.0.1",
	    user: process.env.MYCLINIC_DB_USER,
	    password: process.env.MYCLINIC_DB_PASS,
	    database: "myclinic",
	    dateStrings: true
	}
};