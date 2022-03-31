var express = require("express");

const db = require("./db_connect");
require("dotenv").config();

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/test", (req, res) => {
	db.query("select * from admin", (err, result) => {
		if (err) {
			console.log(err);
		}

		return res.send(result);
	});
});

app.listen(5000, () => {
	console.log("Listening");
});
