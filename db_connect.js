const mysql = require("mysql");
require("dotenv").config();

const db = mysql.createConnection({
	host: process.env.SQL_SERVER,
	port: process.env.SQL_PORT_NUMBER,
	user: process.env.SQL_USERNAME,
	password: process.env.SQL_PASSWORD,
	database: process.env.SQL_DATABASE,
});

db.connect(function (err) {
	if (err) throw err;
	console.log("Database Connected!");
});

module.exports = db;
