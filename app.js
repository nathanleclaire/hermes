var express = require('express');
var r = require('rethinkdb');
var assert = require('assert');

var Mailgun = require('mailgun').Mailgun;

var app = express();

r.connect({db: 'hermes'}, function(err, conn) {
	assert.ok(err === null, err);
	r.dbCreate('hermes').run(conn, function(err, result) {
		if (err) {
			console.log("[WARN] rethinkdb hermes already exists...");
		} else {
			console.log("[INFO] rethinkdb hermes created...");
		}

		r.db('hermes').tableCreate('subscriber', {primaryKey: 'id'}).run(conn, function(err, result) {
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

function sendMail(subject, to, text) {
	mailgun.sendText('zenlikethat@gmail.com', ['Nathan LeClaire <nathan.leclaire@gmail.com>'], 
		'Testing Mailgun Thing',
		'Please confirm you want to subscribe to mailing list',
		'noreply@nathanleclaire.com', 
		{},
		function(err) {
			if (err) console.log("there was an email error", err);
			else console.log("successfully sent email to nathanleclaire.com");
		}
	);
}

function main(conn) {
	var subscribers = r.db('hermes').table('subscriber');
	app.post('/email_signup', function(req, res) {
		var email = req.body.email;
		subscribers.insert({
			email: email
		}).run(conn, function(err, result) {
			if (err) {
				console.log("[ERROR] failed to insert email from someone... ", err);
				res.json({
					success: false
				});
			} else {
				sendMail("Hi!  I hear you'd like to subscribe to my blog.",
						 "nathan.leclaire@gmail.com",
						 "Please confirm that you want to subscribe to the mailing list at this url : .");
				res.json({
					success: true
				});
			}
		});
	});

	app.listen(3000);
}
