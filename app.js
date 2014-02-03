var express = require("express");
var r = require("rethinkdb");
var assert = require("assert");

var Mailgun = require("mailgun").Mailgun;

var app = express();

r.connect({db: "hermes"}, function(err, conn) {
	assert.ok(err === null, err);
	r.dbCreate("hermes").run(conn, function(err, result) {
		if (err) {
			console.log("[WARN] rethinkdb hermes already exists...");
		} else {
			console.log("[INFO] rethinkdb hermes created...");
		}

		r.db("hermes").tableCreate("subscriber", {primaryKey: "id"}).run(conn, function(err, result) {
			if (err) {
				console.log("[WARN] rethinkdb table subscribers already exists...");
			} else {
				console.log("[INFO] rethinkdb table subscribers created...");
			}
		});
	});

	main(conn);
});

app.use(express.urlencoded());
app.use(express.json());

function sendSingleMail(subject, to, text) {
	mailgun.sendText("Nathan LeClaire <nathan.leclaire@gmail.com>", [to.email], 
		subject,
		text,
		function(err) {
			if (err) console.log("there was an email error", err);
			else console.log("successfully sent email to " + to.email);
		}
	);
}

function main(conn) {
	var subscribers = r.db("hermes").table("subscriber");
	app.post("/email_signup", function(req, res) {
		var email = req.body.email;
		subscribers.insert({
			email: email,
			name: "",
			subscriptionConfirmed: false
		}).run(conn, function(err, result) {
			if (err) {
				console.log("[ERROR] failed to insert email from someone... ", err);
				res.json({
					success: false
				});
			} else {
				sendSingleMail("Hi!  I hear you'd like to subscribe to my blog.",
							{
								email: email
							},
						 "Please confirm that you want to subscribe to the mailing list at this url : .");
				res.json({
					success: true
				});
			}
		});
	});

	app.listen(3001);
}
