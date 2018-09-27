// Global Variables

// Boolean Flags
var tankStatusUpdate;
var grafanaStatusUpdate;
var testFireCompleted = 0;
var changed = 0;
var testFireLock = 0;

// Form Data
var reqtype;
var ssl; 
var port;
var hostname;
var url; 
var headers;
var msgbody; 

// Grafana UTC Offsets
var HH = 10;
var MM = 0;


// Swarm Nodes
var nodeNums = 0;
var tankNumsHTML = "";

$( window ).ready(function() {

	//
	// RUN FUNCTION - Start Status Update
	//
	tankStatusUpdate = setInterval(statusUpdate, 5000);


	//
	// RUN FUNCTION - Start Grafana Update
	//
	grafanaStatusUpdate = setInterval(grafanaUpdate, 5000);

	//
	// UI EVENT: GET NODES PARTICIPATING IN SWARM
	//
	$.get( "/api/nodes" )
       	.done(function( data ) {
       		console.log( data );
		for( var i=0; i<data.length; i++ ) {
			var hostname = data[i].Description.Hostname;
			var state = data[i].Status.State;
			console.log( "Hostmame: " + hostname + " State: " + state );
			if( state == "ready" ) {
				nodeNums++;
				tankNumsHTML += "<option value=" + nodeNums + ">" + nodeNums + "</option>\n";
			}
		}
		if ( tankNumsHTML == "" )  {
			alert('No Nodes Ready in Swarm');
			return;
		} else {
			tankNumsHTML = "<select id='tanknum'>\n" + tankNumsHTML + "</select>";
			$('#tankNumHTMLDiv').html(tankNumsHTML);
		}

	});

	//
	// UI EVENT: SELECT CHANGE RAMP RAMP
	//
	$( "#ramp" ).change( function(){
		console.log($(this).val());
		if( $(this).val() == "line" ) {
			$('#prps').css('display','none');
			$('#pstartrps').css('display','block');
			$('#pendrps').css('display','block');
			$('#psteprps').css('display','none');
			$('#pduration').css('display','block');
		}
		if( $(this).val() == "step" ) {
                        $('#prps').css('display','none');
                        $('#pstartrps').css('display','block');
                        $('#pendrps').css('display','block');
			$('#psteprps').css('display','block');
                        $('#pduration').css('display','block');
                }
                if( $(this).val() == "const" ) {
                        $('#prps').css('display','block');
                        $('#pstartrps').css('display','none');
                        $('#pendrps').css('display','none');
                        $('#psteprps').css('display','none');
                        $('#pduration').css('display','block');
                }
	});

	//
	// UI EVENT: SELECT CHANGE REQUEST TYPE 
	//
	$( "#reqtype" ).change( function(){
		if( $(this).val() == "get" ) {
                        $('#pmsgbody').css('display','none');
                }
                if( $(this).val() == "post" ) {
                        $('#pmsgbody').css('display','block');
                }
	});

	//
	// FORM VALIDATION - NUMERIC VALUE 
	//
        $('.numeric').keypress(function(event) {
		var regex = /^\d*$/;
		var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
		if(!regex.test(key)) {
			event.preventDefault();
			return false;
		} 
        });

	//
        // FORM VALIDATION - Duration Value Form Input Keyup Checks
	//
        $('#duration').keypress(function(event) {
                var regexChar = /\d|[smh]/;
                var regexVal = /^[1-9]+[0-9]*[smh]?$/;
                var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
		var duration = $("#duration").val() + key;
		console.log("duration:" + duration);
                if(!regexChar.test(key)) {
                        event.preventDefault();
                        return false;
                } 
		if(!regexVal.test(duration)) {
			event.preventDefault();
                        return false;
		}
        });
	
	//
	// AJAX EVENT - TEST FIRE
	//
	$( "#testFireBtn" ).click( function(event){

                // Prevent form submission
                event.preventDefault();

		if( testFireLock ) { console.log('Locked'); return; }

                reqtype = $("#reqtype").val();
                ssl = $("#ssl").val();
                port = $.trim($('#port').val());
                hostname = $.trim($('#hostname').val());
                url = $.trim($('#url').val());
                headers = $.trim($('#headers').val());
                msgbody = $.trim($('#msgbody').val());

		// Error Check Data Entry
                if( port  == "" ) { $('#port').focus(); alert('Enter Port Number'); return; }
                if( port < 1 || port > 65535 ) { $('#port').focus(); alert('Port Number out of Range 0 - 65535'); return; }
		if( hostname == "" ) { $('#hostname').focus(); alert('Enter Hostname'); return; }
                if( url  == "" ) { $('#url').focus(); alert('Enter URL'); return; }

                // Call Ajax
                var body = {"reqtype":reqtype,"ssl":ssl,"hostname":hostname,"url":url,"headers":headers,"msgbody":msgbody,"port":port};
                //console.log(body);
		testFireLock = 1;
		$('#testFireBtn').html('<i class="fa fa-sync fa-spin"></i> &nbsp;Standby...');
		$('#testfireoutput xmp').text('');
		$('#testfireoutput').css('background-color','#000');
                $.get( "/api/testfire", body)
                .done(function( data ) {
			$('#testFireBtn').html('<i class="fas fa-crosshairs fa-lg"></i> &nbsp;Test Fire');
                        //console.log( data );
			testFireCompleted = 1;
			testFireLock = 0;

                        // Colorfy  Terminal for positive or negative repsponse code
                        if( data.responseCode == 200 || data.responseCode == 302 ) 
			{
                                $('#testfireoutput').css('background-color','#4d964d')
                        } 
			else 
			{
                                $('#testfireoutput').css('background-color','#bd2130')
                        }

                        // Stringify Request Headers
                        var reqheaders = "";
                        $.each( data.requestHeaders, function( key, value ) {
                                if ( key == "headers" ) {
                                        $.each( value, function( subkey, subvalue ) {
                                                reqheaders += subkey + ": " + subvalue + "\n";
                                        });
                                } else  {
                                        reqheaders += key + ": " + value + "\n";
                                }
                        });

                        // Stringify Response Headers
                        var resheaders = "";
                        $.each( data.responseHeaders, function( key, value ) {
                                resheaders += key + ": " + value + "\n";
                        });
                        $('#testfireoutput xmp').text("REQUEST\nHeaders\n" + reqheaders + "\nRESPONSE: " + data.responseCode + "\nHeaders\n" + resheaders + "\nResponse Body\n" + data.body);
	
			// Scroll Screen to Results Area
                        $('html, body').animate({scrollTop:$('#testfireoutput').position().top}, 'slow');
                        $('#fireDiv').css('display','inline-block');
		})
	});

	$( "#testFireBtnTemp" ).click( function(event){

                // Prevent form submission
                event.preventDefault();

                var reqtype = $("#reqtype").val();
                var ssl = $("#ssl").val();
		var ramp = $('#ramp').val();
		var rps = $.trim($('#rps').val());
		var startrps = $.trim($('#startrps').val());
		var endrps = $.trim($('#endrps').val());
		var steprps = $.trim($('#steprps').val());
		var duration = $.trim($('#duration').val());
		var hostname = $.trim($('#hostname').val());
		var url = $.trim($('#url').val());
		var headers = $.trim($('#headers').val());
		var msgbody = $.trim($('#msgbody').val());
		var tag = $.trim($('#tag').val());
		var port = $.trim($('#port').val());

                // Error Check Data Entry
		if( tag  == "" ) { $('#tag').focus(); alert('Enter Identity Tag'); return; }	
		if( port  == "" ) { $('#port').focus(); alert('Enter Port Number'); return; }	
		if( port < 1 || port > 65535 ) { $('#port').focus(); alert('Port Number out of Range 0 - 65535'); return; }

                if( ramp == "const" ) {
                        if( rps == "" ) { $('#rps').focus(); alert('Enter RPS'); return; }
			if( parseInt(rps) > 20000 ) { 
				if( !confirm('Whooaaa, that is a lot of requests per second, you sure?') ) {
					return;
				}
			}
                        if( duration == "" ) { $('#duration').focus(); alert('Enter Duration'); return; }
			var regexVal = /^[1-9]+[0-9]*[smh]$/;
                	if(!regexVal.test(duration)) { $('#duration').focus(); alert('Duration must be in seconds, minutes or hours eg. 1s, 10m, 3h'); return false; }
			console.log('regex test = ' + regexVal.test(duration));
                } else if ( ramp == "line" ) {
			if( startrps == "" ) { $('#startrps').focus(); alert('Enter Starting RPS'); return; }
			if( endrps == "" ) { $('#endrps').focus(); alert('Enter Ending RPS'); return; }
			if( parseInt(endrps) < parseInt(startrps) ) { $('#endrps').focus(); alert('Ending RPS is less than Starting RPS'); return; }
                        if( parseInt(endrps) > 20000 ) {
                                if( !confirm('Whooaaa, that is a lot of requests per second, you sure?') ) {
                                        return;
                                }
                        }
                        if( duration == "" ) { $('#duration').focus(); alert('Enter Duration'); return; }
		} else if ( ramp == "step" ) {
                        if( startrps == "" ) { $('#startrps').focus(); alert('Enter Starting RPS'); return; }
                        if( endrps == "" ) { $('#endrps').focus(); alert('Enter Ending RPS'); return; }
                        if( steprps == "" ) { $('#steprps').focus(); alert('Enter Step Rate RPS'); return; }
			if( duration == "" ) { $('#duration').focus(); alert('Enter Duration'); return; }
			var regexVal = /^[1-9]+[0-9]*[smh]$/;
                	if(!regexVal.test(duration)) { $('#duration').focus(); alert('Duration must be in seconds, minutes or hours eg. 1s, 10m, 3h'); return false; }
                        if( parseInt(endrps) < parseInt(startrps) ) { $('#endrps').focus(); alert('Ending RPS is less than Starting RPS'); return; }
			if( parseInt(steprps) > parseInt(endrps) ) { $('#steprps').focus(); alert('Step Rate larger than Ending RPS'); return; }
                        if( parseInt(endrps) > 20000 ) {
                                if( !confirm('Whooaaa, that is a lot of requests per second, you sure?') ) {
                                        return;
                                }
                        }
		}

		if( hostname == "" ) { $('#hostname').focus(); alert('Enter Hostname'); return; }	
		if( url  == "" ) { $('#url').focus(); alert('Enter URL'); return; }	

		// Call Ajax
		var body = {"reqtype":reqtype,"ssl":ssl,"ramp":ramp,"hostname":hostname,"url":url,"headers":headers,"tag":tag,"msgbody":msgbody,"port":port};
		if( ramp == "line" ) {
			body['startrps'] = startrps;
			body['endrps'] = endrps;
			body['duration'] = duration;
		} else if ( ramp == "const" ) {
			body['rps'] = rps;
			body['duration'] = duration;
		} else if ( ramp == "step" ) {
			body['startrps'] = startrps;
                        body['endrps'] = endrps;
			body['steprps'] = steprps;
			body['duration'] = duration;
		}
		console.log(body);
                $.get( "/api/loadammo", body)
                .done(function( data ) {
                        console.log( data );

			// Colorfy  Terminal for positive or negative repsponse code
			if( data.responseCode == 200 || data.responseCode == 302 ) { 
				$('#testfireoutput').css('background-color','#4d964d') 
			} else { 
				$('#testfireoutput').css('background-color','#bd2130') 
			}

			// Stringify Request Headers
			var reqheaders = "";
                        $.each( data.requestHeaders, function( key, value ) {
				if ( key == "headers" ) {
					$.each( value, function( subkey, subvalue ) {
						reqheaders += subkey + ": " + subvalue + "\n";
					});
				} else	{
                                	reqheaders += key + ": " + value + "\n";
				}
                        });	

			// Stringify Response Headers
			var resheaders = "";
			$.each( data.responseHeaders, function( key, value ) {
				resheaders += key + ": " + value + "\n";
			});	
			$('#testfireoutput').html( "<xmp>REQUEST\n\nRequest Headers\n" + reqheaders + "\nRESPONSE\n\nResponse Code: " + data.responseCode + "\n\nResponse Headers\n" + resheaders + "\nResponse Body\n" + data.body + "</xmp>" );
			$('html, body').animate({scrollTop:$('#testfireoutput').position().top}, 'slow');

			$('#fireDiv').css('display','inline-block');

                });
	});

	//
	// AJAX EVENT - TANK CONTROL BUTTON
	//
        $( "#tankControlBtn" ).on( 'click', function(event){

                // Prevent form submission
                event.preventDefault();

		var command = $("#tankControlBtn").html();
		console.log("Command = " + command);

		// Error Check: no action if already in progress
		if( command == '<i class="fa fa-sync fa-spin"></i> &nbsp; Standby for Tank Status' ) 
		{ 
			console.log('Working Please Wait');
                        alert('Updating Status, Hold your Horses ... or Reload');
			return false; 
		}


             	// Command = Fire!
                if( command == "Tank Ready - Fire!" )
                {

			// Error Check: test fire has been completed
			if( !testFireCompleted ) {
				$('#reqtype').focus();
				alert('You must first execute a test fire of your ammo');
				return false;	
			}

			// Error Check: test fire arguments are unchanged
			if( $("#reqtype").val() != reqtype ) 
			{ 
				alert('You have modified HTTP Request Type since test fire, please run test fire again before launching tanks');
				$('#reqtype').focus();
				return;	
			}
			if( $("#ssl").val() != ssl )
                	{ 
                	        alert('You have modified the Security Protocol since test fire, please run test fire again before launching tanks');
                	        $('#ssl').focus();
                	        return;
                	}
                	if( $("#port").val() != port )
                	{
                	        alert('You have modified the Port target since test fire, please run test fire again before launching tanks');
                	        $('#port').focus();
                	        return;
                	}
                	if( $("#hostname").val() != hostname )
                	{
                	        alert('You have modified the Hostname target since test fire, please run test fire again before launching tanks');
                	        $('#hostname').focus();
                	        return;
                	}
                	if( $("#url").val() != url )
                	{
                	        alert('You have modified the Request URL since test fire, please run test fire again before launching tanks');
                	        $('#url').focus();
                	        return;
                	}
                	if( $("#headers").val() != headers )
                	{
                	        alert('You have modified the Request Headers since test fire, please run test fire again before launching tanks');
                	        $('#headers').focus();
                	        return;
                	}
                	if( $("#msgbody").val() != msgbody )
                	{
                	        alert('You have modified the Request Message Body since test fire, please run test fire again before launching tanks');
                	        $('#msgbody').focus();
                	        return;
                	}

			// Retrieve Tank Setting Attributes
                	var tag = $.trim($('#tag').val());
                	var ramp = $('#ramp').val();
                	var rps = $.trim($('#rps').val());
                	var startrps = $.trim($('#startrps').val());
                	var endrps = $.trim($('#endrps').val());
                	var steprps = $.trim($('#steprps').val());
                	var duration = $.trim($('#duration').val());
                	var tanknum = $("#tanknum").val();
	
			// Error Check: Tank Settings	
	                if( tag  == "" ) { $('#tag').focus(); alert('Enter Identity Tag'); return; }
	
	                if( ramp == "const" ) {
	                        if( rps == "" ) { $('#rps').focus(); alert('Enter RPS'); return; }
	                        if( parseInt(rps) > 20000 ) {
	                                if( !confirm('Whooaaa, that is a lot of requests per second, you sure?') ) {
	                                        return;
	                                }
	                        }
	                        if( duration == "" ) { $('#duration').focus(); alert('Enter Duration'); return; }
	                        var regexVal = /^[1-9]+[0-9]*[smh]$/;
                        	if(!regexVal.test(duration)) { $('#duration').focus(); alert('Duration must be in seconds, minutes or hours eg. 1s, 10m, 3h'); return false; }
                        	console.log('regex test = ' + regexVal.test(duration));
               		} else if ( ramp == "line" ) {
                        	if( startrps == "" ) { $('#startrps').focus(); alert('Enter Starting RPS'); return; }
                        	if( endrps == "" ) { $('#endrps').focus(); alert('Enter Ending RPS'); return; }
                        	if( parseInt(endrps) < parseInt(startrps) ) { $('#endrps').focus(); alert('Ending RPS is less than Starting RPS'); return; }
                        	if( parseInt(endrps) > 20000 ) {
                        	        if( !confirm('Whooaaa, that is a lot of requests per second, you sure?') ) {
                        	                return;
                        	        }
                        	}
                        	if( duration == "" ) { $('#duration').focus(); alert('Enter Duration'); return; }
                	} else if ( ramp == "step" ) {
                	        if( startrps == "" ) { $('#startrps').focus(); alert('Enter Starting RPS'); return; }
                	        if( endrps == "" ) { $('#endrps').focus(); alert('Enter Ending RPS'); return; }
                	        if( steprps == "" ) { $('#steprps').focus(); alert('Enter Step Rate RPS'); return; }
                	        if( duration == "" ) { $('#duration').focus(); alert('Enter Duration'); return; }
                	        var regexVal = /^[1-9]+[0-9]*[smh]$/;
                	        if(!regexVal.test(duration)) { $('#duration').focus(); alert('Duration must be in seconds, minutes or hours eg. 1s, 10m, 3h'); return false; }
                	        if( parseInt(endrps) < parseInt(startrps) ) { $('#endrps').focus(); alert('Ending RPS is less than Starting RPS'); return; }
                	        if( parseInt(steprps) > parseInt(endrps) ) { $('#steprps').focus(); alert('Step Rate larger than Ending RPS'); return; }
                	        if( parseInt(endrps) > 20000 ) {
                	                if( !confirm('Whooaaa, that is a lot of requests per second, you sure?') ) {
                	                        return;
                	                }
                        	}
                	}

			// Prepare Ajax Request
                	var body = {"reqtype":reqtype,"ssl":ssl,"ramp":ramp,"hostname":hostname,"url":url,"headers":headers,"tag":tag,"msgbody":msgbody,"port":port,"tanknum":tanknum};
                	if( ramp == "line" ) {
                	        body['startrps'] = startrps;
                	        body['endrps'] = endrps;
                	        body['duration'] = duration;
                	} else if ( ramp == "const" ) {
                	        body['rps'] = rps;
                	        body['duration'] = duration;
                	} else if ( ramp == "step" ) {
                	        body['startrps'] = startrps;
                	        body['endrps'] = endrps;
                	        body['steprps'] = steprps;
                	        body['duration'] = duration;
                	}
                	
			console.log("Firing Tanks");
			console.log(body);
	                clearInterval(tankStatusUpdate);
                        $('#tankControlBtn').html('<i class="fa fa-sync fa-spin"></i> &nbsp;Standby...');

			$.get( "/api/livefire", body)
                	.done(function( data ) {
                	        console.log( data );
				if( data.ID ) {
					console.log(data.ID);
					// If Data.ID returned, docker service started with serviceID = Data.ID
					//logging( 'start' );
				} else {
					console.log(data.message);
					alert(data.message);
				}
				tankStatusUpdate = setInterval(statusUpdate, 5000);
			});
		}

		// SWITCH Command = Reset Battle Field
               	if( command == "Reset Battle Field" || command == "Tank Running - Cease Fire!" )
                {
			clearInterval(tankStatusUpdate);
			$('#tankControlBtn').html('<i class="fa fa-sync fa-spin"></i> &nbsp;Standby...');
                        $.get( "/api/reset", body)
                        .done(function( data ) {
                                console.log( data );
				if( data.status ) {
					setTimeout( function() {
						tankStatusUpdate = setInterval(statusUpdate, 5000);
						//$('#warzoneoutput xmp').html('');
					}, 10000);
				} else {
					console.log( body );		
				}
                        });
                }
	
	});
});

//
// FUNCTION - Retrieves current docker service status for tank
//
function statusUpdate() {

	$.get( "/api/svcstatus")
        .done(function( data ) {
        	console.log( data );

		var json = data['body'];
		var responseCode = data['responseCode'];
		var tasks = [];
		var running = 0;

                // No Services Running
                if( responseCode == 404 ) {
                        console.log('Tank Service Not Running');
			$('#tankStatus').html('Tanks Service Not Running').css('color','#ff0000');
			$('#tankControlBtn').html('Fire!');
                        return( false );
                }

                // Check All Tasks with Tank Image
                if( responseCode == 200 ) {
                        for( var i=0; i<json.length; i++ ) {
                                var image = json[i]['Spec']['ContainerSpec']['Image'];
                                var regex = /tankswarm/;
                                if( regex.test(image) ) {
                                        tasks.push( json[i]['ID'] );
                                        if( json[i]['Status']['State'] == "running" ) { running = 1; }
                                        //console.log("Image: " + json[i]['Spec']['ContainerSpec']['Image']);
                                        //console.log("Task ID: " + json[i]['ID']);
                                        //console.log("Service ID: " + json[i]['ServiceID']);
                                        //console.log("Status: " + json[i]['Status']['State']);
                                        //console.log("\n");
                                }
                        }
                }

                // Tank Service Registered but Not Running
                if( !running && tasks.length == 0 ) {
                        console.log( "Tank Service Not Running" );
			$('#tankControlBtn').removeClass('redBtn').addClass('greenBtn');
                        $('#tankControlBtn').html('Tank Ready - Fire!');
                        return false;
                } else if ( !running && tasks.length > 0 ) {
                        console.log( "Tank Service Registered but Not Running" );
			$('#tankControlBtn').removeClass('greenBtn').addClass('redBtn');
                        $('#tankControlBtn').html('Reset Battle Field');
                        return false;
                } else if( running ) {
                        console.log( "Tank is Running" );
			$('#tankControlBtn').removeClass('greenBtn').addClass('redBtn');
                        $('#tankControlBtn').html('Tank Running - Cease Fire!');
                        return true;
                }

        });
	return true;
}

//
// UPDATES GRAFANA GRAPH RENDER 
// 
function grafanaUpdate() {

        var d = new Date();
        var locationHostname = location.hostname;
        var rpsURL = "//" + locationHostname + ":3000/render/dashboard-solo/db/tankswarm?panelId=2&width=600&height=280&tz=UTC%2B" + HH + "%3A" + MM + "&date=" + d.getTime();
        var resURL = "//" + locationHostname + ":3000/render/dashboard-solo/db/tankswarm?panelId=4&width=600&height=280&tz=UTC%2B" + HH + "%3A" + MM + "&date=" + d.getTime();
        $('#grafanaRPS').attr("src", rpsURL);
        $('#grafanaResponse').attr("src", resURL);

}

//
// EXPOSES DOCKER SERVICE LOGS FOR TANK STACK
//
function logging( command ) {

	if ( command == 'start' ) {
                console.log('Starting Logging');
		//var jqxhr = $.get( "/logs" )
               	//.always( function(data) {
	 	//	console.log(data);
		//});
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "/logs", true);
		//var url = location.hostname;
		//var newurl = "//" + url + ":3188/v1.24/services/tank/logs?follow=true&stdout=true";
		//console.log( newurl );
		//xhr.open("GET", newurl, true);
		xhr.onprogress = function () {
			console.log('DATA RECEIVED');
			console.log("Logs:", xhr.responseText);
			//$('#warzoneoutput xmp').html(xhr.responseText);

		}
		xhr.send();
	} else if ( command == 'stop' ) {
                console.log('Stopping Logging');
	}

	return true;
}
