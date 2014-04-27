// Wait for page load
$(function() {

	// API root
	var APIroot = "https://congress.api.sunlightfoundation.com/";

	// Send the api key with each request
	// Don't abuse this api key. seriously.
	$.ajaxSetup({
		data: {
			"apikey": "7e1b99496c5f4338b415a4caae7bcdb9"
		}
	});

	// Clean up the current visible alerts
	function cleanAlerts() {
		$("#searching").addClass("hidden");
		$("#locating").addClass("hidden");
		$("#searchFailed").addClass("hidden");
		$("#noneFound").addClass("hidden");
	}

	// A request to the API has failed
	function apiFail() {
		// FIXME
		alert('An error occured contacting our backend api. We\'re very sorry. Please try again.');
	}

	// When the representatives are successfully found
	function gotRepresentatives(data) {
		// If no data found, I.E. bad zip
		if (data.results.length === 0) {
			// Show the error and bail
			cleanAlerts();
			$("#noneFound").removeClass("hidden");
			return;
		}
		// Clear out old results
		$('#contacts').empty();
		// Loop each rep
		$.each(data.results.reverse(), function(i, rep) {
			// Create the html
			var info = $('<div class="panel panel-default"><div class="panel-heading"></div><div class="panel-body"><p class="lead">Contact <span /> via phone at <a target="_blank" />, via <span></span> website <a target="_blank">here</a> and/or in writing at <span></span> Washington, DC office:</p><div class="well" /></div></div>');
			// Insert data
			info.find('.panel-heading').text((rep.chamber === "house" ? 'Representative' : 'Senator') + ' ' + rep.first_name + " " + rep.last_name);
			info.find('p').find('span:eq(0)').text((rep.chamber === "house" ? 'Representative' : 'Senator') + " " + rep.last_name);
			info.find('p').find('a:eq(0)').text(rep.phone);
			info.find('p').find('a:eq(0)').attr('href', 'tel:' + rep.phone);
			info.find('p').find('a:eq(1)').attr('href', rep.contact_form);
			info.find('p').find('span:eq(1)').text(rep.gender === "M" ? 'his' : 'her');
			info.find('p').find('span:eq(2)').text(rep.gender === "M" ? 'his' : 'her');
			info.find('.well').text(rep.office);
			// Add to modal
			$('#contacts').append(info);
		});
		// Hide current modal, show info modal
		$('#findRepresentative').modal('hide');
		$('#contactRepresentative').modal('show');
	}

	// Location grab successful
	function locationSuccess(location) {
		// Log success
		cleanAlerts();
		$("#locating").removeClass('hidden');
		// Query for the given lat and long
		$.get(APIroot + 'legislators/locate', {
			latitude: location.coords.latitude,
			longitude: location.coords.longitude,
			per_page: 'all'
		}, function(data) {
			gotRepresentatives(data);
		}).fail(apiFail);
	}

	// Location failed for one reason or another
	function locationFailed(err) {
		// Show the error
		cleanAlerts();
		$("#searchFailed").removeClass("hidden");
	}

	// Bind the get location link clicked
	$("#getLocation").click(function() {
		// Show the searching alert
		cleanAlerts();
		$("#searching").removeClass("hidden");
		// If supported
		if (navigator.geolocation) {
			// Retrive 
			navigator.geolocation.getCurrentPosition(
				locationSuccess,
				locationFailed, 
				{
					timeout: 15000
				}
			);
		} else {
			// No support, trigger fail
			locationFailed();
		}
	});

	// When the find reps button is pressed
	$("#findReps").click(function() {
		// Show location log
		cleanAlerts();
		$("#locating").removeClass('hidden');
		// Retrieve that zip
		$.get(APIroot + 'legislators/locate', {
			zip: $("#zip").val(),
			per_page: 'all'
		}, function(data) {
			gotRepresentatives(data);
		}).fail(apiFail);
	});

	// Hide the two status changes when the page closes
	$('#findRepresentative').on('hidden.bs.modal', cleanAlerts);

	// On enter press
	$('#zip').keyup(function (e) {
		// Get the zip
		var zip = $('#zip').val();
		// Get the parent div
		var parent = $('#zip').parent();
		// If no zip entered
		if (zip === "") {
			// Show error validation
			parent.removeClass('has-error');
			parent.find('span').addClass('hidden');
		// zip has been entered
		} else {
			// Show the validation now 
			parent.find('span').removeClass('hidden');
			// Check if it's valid
			if (/^\d{5}(-\d{4})?$/.test(parseInt(zip, 10))) {
				// Show success
				parent.removeClass('has-error').addClass('has-success');
				parent.find('span').removeClass('glyphicon-remove').addClass('glyphicon-ok');
			} else {
				// Show error
				parent.removeClass('has-success').addClass('has-error');
				parent.find('span').removeClass('glyphicon-ok').addClass('glyphicon-remove');
			}
		}
		// If the key was enter
		if (e.which == 13) {
			// Click the continue button
			$('#findReps').click();
		}
	});

});