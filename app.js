var express = require('express');
var r = require('rethinkdb');
var assert = require('assert');

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
				res.json({
					success: true
				});
			}
		});
	});

	app.listen(3000);
}
