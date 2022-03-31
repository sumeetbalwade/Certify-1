var express = require("express");
var uuid = require("uuid");

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

app.post("/register", (req, res, next) => {
	const { email } = req.body;
	if (email && email.length > 0) {
		db.query("SELECT id FROM admins WHERE email = ?", email, (err, result) => {
			if (err) throw err;
			if (result.length > 0) {
				return res.status(401).json({ message: "Email already exists" });
			} else {
				const reqParams = ["name", "email", "password"];
				newUser = [];
				for (const p of reqParams) {
					if (p in req.body && req.body[p].length > 0) {
						newUser.push(req.body[p]);
					} else {
						return res.status(401).json({ message: "Some required fields empty" });
					}
				}
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					if (err) {
						return res.status(500).json({ message: "Something went wrong", err: err });
					} else {
						newUser.pop();
						newUser.push(hash);
						db.query("INSERT INTO admin(name, email, password) VALUES (?)", [newUser], (err, result) => {
							if (err) throw err;
							else {
								return res.status(200).json({ message: "Admin Created" });
							}
						});
					}
				});
			}
		});
	} else {
		return res.status(401).json({ message: "Some required fields empty" });
	}
});

app.post("/login", (req, res, next) => {
	const { email, password } = req.body;
	if (email && email.length > 0 && password && password.length > 0) {
		db.query("SELECT * FROM admin WHERE email = ?", email, (err, result) => {
			if (err) throw err;
			bcrypt.compare(password, result["password"], (err, result) => {
				if (err) {
					return res.status(401).json({ message: "Login Failed" });
				}
				if (result) {
					const token = jwt.sign(
						{
							email: result["email"],
							id: result["id"],
						},
						process.env.JWT_SECRET,
						{
							expiresIn: "7d",
						}
					);
					console.log(result[("email", " logged in")]);
					return res.status(200).json({ message: "Login Successful", token: token });
				}
			});
		});
	} else {
		return res.send("Some required parameters missing");
	}
});

app.get("/admin", (req, res, next) => {
	db.query("SELECT * FROM admin", (err, result) => {
		if (err) throw err;
		return res.status(200).json({ message: "List of admins", admins: result });
	});
});

app.post("/certificate", (req, res, next) => {
	const reqParams = ["startDate", "endDate", "role", "firstName", "lastName", "email"];
	newCertificate = [];
	for (const p of reqParams) {
		if (p in req.body && req.body[p].length > 0) {
			newCertificate.push(req.body[p]);
		} else {
			return res.status(401).json({ message: "Some required fields empty" });
		}
	}
	const id = uuid.v1();
	newCertificate.push(id);
	let phone = null;
	if ("phone" in req.body) {
		phone = req.body.phone;
	}
	newCertificate.push(phone);
	db.query("SELECT id FROM admin WHERE email = ?", req.userData.email, (err, admin) => {
		if (err) throw err;
		const adminId = admin[0].id;
		newCertificate.push(adminId);
		db.query("INSERT INTO certificates(startDate, endDate, role, firstName, lastName, email, id, phone, createdBy) VALUES (?)", [newCertificate], (err, result) => {
			if (err) throw err;
			else {
				return res.status(200).json({ message: "Certificate Created" });
			}
		});
	});
});

app.listen(5000, () => {
	console.log("Listening");
});
