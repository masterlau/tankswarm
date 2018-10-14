$( window ).ready(function() {

        var winW = $(window).width();
        var winH = $(window).height();
	console.log( "winW: " + winW + " winH: " + winH);
	
	// Vertical Center Login Window
	if ($('#loginDiv').height() < winH) {
		$( '#loginDiv' ).css( 'margin-top', (winH-($('#loginDiv').height()))/2 );
	}

	//
	// LOGIN CREDENTIALS CHECK
	//
	$( "#loginForm" ).submit( function(event){

		// Prevent form submission
		event.preventDefault();

		var username = $.trim($("#loginFormUsername").val());
		var password = $.trim($("#loginFormPassword").val());

		// Error Check Data Entry
		if( username == "" ) {
			alert('Please Enter a Username');
			return;
		}
                if( password == "" ) {
                        alert('Please Enter a Password');
			return;
                }

		// Ajax Request
		var body = { "username":username,"password":password};
		$('#message').html("");
		$.get( "/api/login", body)
		.done(function( data ) {
    			console.log( data );
			if( data.response == "true" ) {
				document.location = "/api/dashboard";
			} else {
				$('#message').html('Incorrect Username or Password');
			}
		});
	});

});

// 
// WINDOW RESIZE - VERTICAL CENTER
//
$( window ).resize(function() {
        var winW = $(window).width();
        var winH = $(window).height();
        console.log( "winH: " + winW + " winH: " + winH);

        // Vertical Center Login Window
        if ($('#loginDiv').height() < winH) {
                $( '#loginDiv' ).css( 'margin-top', (winH-($('#loginDiv').height()))/2 );
        }
});

