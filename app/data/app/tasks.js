'use strict';

var tasks = [];
var running = 0;

const request = require('request');


	// Inspect All Services
        var url = 'http://unix:/var/run/docker.sock:/v1.24/tasks';

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
		var json = JSON.parse( body );

		// No Services Running
		if( response.statusCode == 404 ) {
			console.log('Tank Not Running');
			return( false );
		}

		// Check All Tasks with Tank Image
		if( response.statusCode == 200 ) {	
			for( var i=0; i<json.length; i++ ) {
				var image = json[i]['Spec']['ContainerSpec']['Image'];
				var regex = /tankswarm/;
                        	if( regex.test(image) ) {	
					tasks.push( json[i]['ID'] );
					if( json[i]['Status']['State'] == "running" ) { running = 1; }
					//console.log("Image: " + json[i]['Spec']['ContainerSpec']['Image']);
                                        //console.log("Task ID: " + json[i]['ID']);
                                        console.log("Service ID: " + json[i]['ServiceID']);
                                        //console.log("Status: " + json[i]['Status']['State']);
                                        //console.log("\n");
                                }
			}
		}

		// Tank Service Registered but Not Running
		if( !running && tasks.length == 0 ) {
			console.log( "Tank Service Not Registered" ); 
			return false;
		} else if ( !running && tasks.length > 0 ) {
                        console.log( "Tank Service Registered but Not Running" );
                        return false;

		} else if( running ) {
			console.log( "Tank is Running" );
			return true;
		} 

        });

