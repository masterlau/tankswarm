'use strict';

let body = [];
let index = 0;
const request = require('request');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

// Inspect All Services
var url = "http://unix:/var/run/docker.sock:/v1.24/services/tank/logs?follow=true&stdout=true";
	
request(url, { headers: { host: 'localhost' }})
.on( 'response', function( response ) {
	//console.log(res);
})
.on( 'data', function(chunk) {
	body.push( chunk );
	console.log(decoder.end(chunk));
	//var strchunk = bin2string(chunk);
	//console.log(strchunk);
	//console.log(chunk.toString('utf8'));
	//index++;
  })
.on( 'end', function() {
	console.log('ended');
});

function bin2string(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(parseInt(array[i], 2));
  }
  return result;
}

//, function( error, response, body) {
   //     	console.log( "Error: " + error );
     ///   	console.log( "Response: " + response.statusCode );
        //      	console.log( "Body: " + body );
       	//}).pipe( function(body) { console.log( body); }
	//.pipe( function( response, body ) {
        //       	console.log( "Response: " + response.statusCode );
        //       	console.log( "Body: " + body );
	//});
