'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const http = require('http');
const request = require('request');
const UINT64 = require('cuint').UINT64 // NodeJS

// Constants
const PORT = 8888;
const HOST = '127.0.0.1';

// App
const app = express();
app.use(cookieParser());

//
// Login
//
app.get('/api/login', (req, res) => {

	var timestamp = new Date().getTime();
	console.log( timestamp + " /api/login");

	var username = req.query.username;
	var password = req.query.password;

	if ( username == "admin" && password == "admin" ) {
		var json = { "response": "true" }
	} else {
		var json = { "response": "false" }
	}

	res.type('json');
	res.cookie('token', 'df4344c94ade99572ac25e5107a3f7a8');
	res.send(JSON.stringify(json));
});


//
// Dashboard
//
app.get('/api/dashboard', (req,res) => {

        var timestamp = new Date().getTime();
        console.log( timestamp + " /api/dashboard");

	if( req.cookies && req.cookies.token == 'df4344c94ade99572ac25e5107a3f7a8') {
		var dashboard = fs.readFileSync('/www/app/dashboard.html');
		res.type('html');
		res.send(dashboard.toString());
	} else {
		res.type('html');
		res.redirect(302,'/');
	}
});

//
// Test Fire
//
app.get('/api/testfire', (req,res) => {

        var timestamp = new Date().getTime();
        console.log( timestamp + " /api/testfire");

        var reqtype = req.query.reqtype;
        var ssl = req.query.ssl;
        var hostname = req.query.hostname;
        var url = req.query.url;
        var headers = req.query.headers;
        var portnum = req.query.port;

        var URI = "";
        URI += ssl + "://" + hostname + url;
        //console.log ('URI: ' + URI);

        var options = {
                url: URI,
                method: reqtype,
                followRedirect: false,
                headers: {}
        };

        if( headers != "" ) {
                var headersString = {};
                var lines = headers.split('\n');
                for(var i = 0; i < lines.length; i++) {
                        var headerArray = lines[i].split(/:/);
                        options.headers[headerArray[0]] = headerArray[1].trim();
                }
        }

	request(URI, options, (error, response, body) => {
               	//console.log( "Error: " + error );
               	//console.log( "Response: " + response );
               	//console.log( "Body: " + body );
		if( !error ) {
			var jsonResponse = { "requestHeaders": options, "responseCode": response.statusCode, "responseHeaders": response.headers, "body": body};
                	res.type('json');
                	res.send( jsonResponse );
		} else {
			var jsonResponse = { "requestHeaders": options, "error": error };
                       	res.type('json');
                       	res.send( jsonResponse );
		}
	})

});

//
// Live Fire
//
app.get('/api/livefire', (req,res) => {

        var timestamp = new Date().getTime();
        console.log( timestamp + " /api/livefire");

	// ERROR CHECK: Check Paramaters Arrived
	var reqtype = req.query.reqtype;
	var ssl = req.query.ssl;
	var ramp = req.query.ramp;
	var rps = req.query.rps;
	var startrps = req.query.startrps;
	var endrps = req.query.endrps;
	var steprps = req.query.steprps;
	var hostname = req.query.hostname;
	var url = req.query.url;
	var headers = req.query.headers;
	var duration = req.query.duration;
	var tag = req.query.tag;
	var portnum = req.query.port;

	var URI = "";
	URI += ssl + "://" + hostname + url;
	//console.log ('URI: ' + URI);
		
	tag = tag.replace(/ /g,'');

	// DATA: Prepare Ammo file contents

	var ammo = "";

	// Wrap headers in square brackets and add to ammo string
	// eg.
	// (before) Authorization: Bearer 12335ASDFA2342
	// (after) [Authorization: Bearer 12335ASDFA2342]
        if( headers != "" ) {
                var headersString = {};
                var lines = headers.split('\n'); 
                for(var i = 0; i < lines.length; i++) {
                        //var headerArray = lines[i].split(/:/);
                        ammo += "[" + lines[i] + "]\n";
                }
        }

	// Construct URL line
	// eg. [Host: www.real.com]
	ammo += "[Host: " + hostname + "]\n";
	if( reqtype.toLowerCase() == "get" ) { 
		ammo += url + " HTTP/1.1 " + tag; 
	} else {
		// calculate body size
		ammo += "";	
	}
	ammo += "\n\n";
	console.log("Ammo\n" + ammo);

      	// FILE: Write ammo string to ammo file
        fs.writeFile('/www/conf/ammo', ammo,  function(err) {
       		// Check file opened without issue
	      	if (err) {
	     		return console.error("Could Not Write to Ammmo File => " + err);
	       	}
        });

	// DATA: Prepare Tank YAML file contents
	var loadyml = "";
	loadyml += "phantom:\n";
	//loadyml += "  writelog: all\n";
	loadyml += "  phout_file: /var/loadtest/phout.log\n\n";
        loadyml += "  address: localhost:" + portnum + "\n";
        if( ssl == "https" ) {
                loadyml += "  ssl: true\n";
        }
	loadyml += "  load_profile:\n";
	loadyml += "    load_type: rps\n";
	if( ramp == "const" ) {
		loadyml += "    schedule: const(" + rps + ", " + duration + ")\n";
	}
	if( ramp == "line" ) {
		loadyml += "    schedule: line(" + startrps + "," + endrps + "," + duration + ")\n";
	}
        if( ramp == "step" ) {
        	loadyml += "    schedule: step(" + startrps + "," + endrps + "," + steprps + "," + duration + ")\n";
        }
	loadyml += "  header_http: \"1.1\"\n";
	loadyml += "  ammofile: /var/loadtest/ammo\n";
	if( reqtype == "get" ) {
		loadyml += "  ammo_type: uri\n";
	} else {
		loadyml += "  ammo_type: uripost\n";
	}

	loadyml += "\ntelegraf:\n";
	loadyml += "  enabled: false\n";
	loadyml += "console:\n";
	loadyml += "  short_only: true\n";
	//console.log("load.yml\n" + loadyml);
		
	// FILE: write Tank YAML file contents to Load.yml
        fs.writeFile('/www/conf/load.yml', loadyml,  function(err) {

        	// Check file opened without issue
        	if (err) {
        		return console.error("Could Not Write to Load.yml File => " + err);
        	}
        });

	// API CALL => Docker: xheck if tank service running
        var url  = "http://unix:/var/run/docker.sock:/v1.24/services/tank";

        request({
                url: url,
                method: 'GET',
                headers: {
                        host: "localhost",
                },
        }, (error, response, body) => {
                //console.log( "Body: " + body );
                var json = JSON.parse(body);
                if( json.message == "service tank not found" ) {

                        // Create Service
                        var tanknum = req.query.tanknum;
                        var replicas = parseInt(tanknum, 10);

                        var msgbody = {
                                "Name": "tank",
                                "TaskTemplate": {
                                        "ContainerSpec": {
                                                "Image": "petertwliu/tankswarm:v11",
                                                "Mounts":[{
                                                        "ReadOnly": false,
                                                        "Source": "tank-vol",
                                                        "Target": "/var/loadtest",
                                                        "Type": "volume"
                                                }]
                                        },
                                        "RestartPolicy": {
                                                "Condition": "none"
                                        }
                                },
                                "Mode": {
                                        "Replicated": {
                                                "Replicas": replicas
                                        }
                                },
                                "Networks": [{
                                        "Target": "warzone"
                                }]
                        };

			// API CALL => Docker: Docker Create Service
			//console.log('API Call => Docker /service/create'); 
			var url  = "http://unix:/var/run/docker.sock:/v1.24/services/create";

        		request({
      				url: url,
             			method: 'POST',
                		headers: {
                        		host: "localhost",
                		},
               			body: JSON.stringify(msgbody),
			}, (error, response, body) => {
                		//console.log( "Response: " + response.statusCode );
                		//console.log( "Error: " + error );
                		//console.log( "Body: " + body );
                		res.type('json');
                		res.send(body);
			});
		}
	});
});

//
// Cease Fire - Stop 
//
app.get('/api/ceasefire', (req,res) => {

        var timestamp = new Date().getTime();
        console.log( timestamp + " /api/ceasefire");

        // Check if Tank Already Running
        var url  = "http://unix:/var/run/docker.sock:/v1.24/services/tank";

        request({
                url: url,
                method: 'GET',
                headers: {
                        host: "localhost",
                },
        }, (error, response, body) => {
                console.log( "Body: " + body );
                var json = JSON.parse(body);

		// Tank Service Not Running - Respond & Exit
		if( json.message != "service tank not found" ) {
                        res.type('json');
                        res.send('{"status":false, "message":"Tank is already running"}');
			return;
		}

		// Tank Service Running - Try Stop Service
                if( json.message == "service tank not found" ) {

			// Attempt to stop Tank Service
        		var url = 'http://unix:/var/run/docker.sock:/v1.24/services/tank';

        		request({
                		url: url,
                		method: 'DELETE',
                		headers: {
                       			host: "localhost",
                		},
        		}, (error, response, body) => {
                		//console.log( "Response: " + response.statusCode );
                		//console.log( "Error: " + error );
                		//console.log( "Body: " + body );

				// Error Stopping  Service 
				if( response.statusCode != 200 ) {
					// Error Stopping Tank Service
                                        res.type('json');
                                        res.send('{"status":false, "message":"Could not stop Tank service", "error": error}');
				} else {
					// Tank Service Stopped
                        		res.type('json');
                        		res.send('{"status":true, "message":"Tank Service Stopped"}');
				}
        		});
		}
	});
});

//
// Terminate Tank Service Swarm
//
app.get('/api/reset', (req,res) => {

        var timestamp = new Date().getTime();
        console.log( timestamp + " /api/reset");

        // Check if Tank Already Running
        var url  = "http://unix:/var/run/docker.sock:/v1.24/services/tank";

        request({
                url: url,
                method: 'DELETE',
                headers: {
                        host: "localhost",
                },
        }, (error, response, body) => {
                //console.log( "Response: " + response.statusCode );
                //console.log( "Error: " + error );
                //console.log( "Body: " + body );
		res.type('json');
		if( response.statusCode == 200 ) {
			res.send( '{"status": true}');
		} else {
			res.send( '{"status": false, "body": ' + body + '}' );
		}
	});
});

//
// Service Status
//
app.get('/api/svcstatus', (req,res) => {

        var timestamp = new Date().getTime();
        console.log( timestamp + " /api/svcstatus");

        var url = "http://unix:/var/run/docker.sock:/v1.24/tasks";
        request({
                url: url,
                method: 'GET',
                headers: {
                        host: "localhost",
                },
        }, (error, response, body) => {
                //console.log( "Response: " + response.statusCode );
                //console.log( "Error: " + error );
                //console.log( "Body: " + body );
                res.type('json');
                res.send( '{"responseCode":'+response.statusCode+',"error":"'+error+'","body":'+ body + '}');
        });

});

//
// DEPRECATED: Get Logs
// Known bug in Docker API service logs API
//
app.get('/api/logs', (req,res) => {

        var timestamp = new Date().getTime();
        console.log( timestamp + " /api/logs");

	// Get Logs 
	var url = "http://unix:/var/run/docker.sock:/v1.24/services/tank/logs?follow=true&stdout=true";

//	request(url, { headers: { host: 'localhost' }})
//	.on( 'response', function( response ) {
//		//res.writeHead(200, {"Content-Type": "text/plain"});
//		console.log('response');
//	})
//	.on( 'upgrade', function(req, socket, head) {
//		console.log('upgraded');
//	})
//	.on( 'data', function(chunk) {
//        	//console.log(chunk.toString('utf8'));
//		res.write(chunk.toString('utf8'),'utf8');
//  	})
//	.on( 'timeout', function() {
//		console.log('timeout');	
//	})
//	.on( 'end', function(chunk) {
//        	console.log('ended');
//	});

	request({
		url: url, 
		method: 'GET',
		headers: { 
			host: 'localhost',
			connection: "keep-alive",
		}
	})
	.on( 'response', function( response ) {
		//res.writeHead(101, {"Content-Type": "text/plain"});
		//console.log(response);
	})
 	.on( 'data', function( chunk ) {
		//response.pipe(res);
		//res.type('text');
		console.log(chunk.toString('utf8'));
		res.write(chunk.toString('utf8'));
	})
	.on( 'end', function() {
		console.log('ended');
		//res.end();
	})
	.on( 'upgrade', function() {
		console.log('upgraded');
	});
});

//
// Get Swarm Node Member Information
//
app.get('/api/nodes', (req,res) => {

        var timestamp = new Date().getTime();
        console.log( timestamp + " /api/nodes");

	// Get Nodes Particpating in Swarm 
	var url = "http://unix:/var/run/docker.sock:/v1.37/nodes";

	request({
		url: url,
		method: 'GET',
                headers: {
                        host: 'localhost',
                }
	}, ( error, response, body ) => {
		//console.log("Error: " + error);
		//console.log("Response: " + response.statusCode);
		//console.log("Body: " + body);
		res.type('json');
		res.send( body );
	});

});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
