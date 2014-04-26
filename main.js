// Wait for page load
$(function() {

	// API root
	var APIroot = "https://congress.api.sunlightfoundation.com/";

	// Send the api key with each request
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
		alert('An error occured contacting our backend api. We\'re very sorry. Please try again.');
	}

	// When the representatives are successfully found
	function gotRepresentatives(data) {
		var results = data.results;
		if (results.length === 0) {
			cleanAlerts();
			$("#noneFound").removeClass("hidden");
			return;
		}
		$('#contacts').empty();
		$.each(results.reverse(), function(i, rep) {
			var info = $('<div class="panel panel-default"><div class="panel-heading"></div><div class="panel-body"><p class="lead">Contact <span /> via phone at <a target="_blank" />, via <span></span> website <a target="_blank">here</a> and/or in writing at <span></span> Washington, DC office:</p><div class="well" /></div></div>');
			info.find('.panel-heading').text((rep.chamber === "house" ? 'Representative' : 'Senator') + ' ' + rep.first_name + " " + rep.last_name);
			info.find('p').find('span:eq(0)').text((rep.chamber === "house" ? 'Representative' : 'Senator') + " " + rep.last_name);
			info.find('p').find('a:eq(0)').text(rep.phone);
			info.find('p').find('a:eq(0)').attr('href', 'tel:' + rep.phone);
			info.find('p').find('a:eq(1)').attr('href', rep.contact_form);
			info.find('p').find('span:eq(1)').text(rep.gender === "M" ? 'his' : 'her');
			info.find('p').find('span:eq(2)').text(rep.gender === "M" ? 'his' : 'her');
			info.find('.well').text(rep.office);
			$('#contacts').append(info);
		});
		$('#findRepresentative').modal('hide');
		$('#contactRepresentative').modal('show');
	}

	// Location grab successful
	function locationSuccess(location) {
		cleanAlerts();
		$("#locating").removeClass('hidden');
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
		cleanAlerts();
		$("#searchFailed").removeClass("hidden");
	}

	// Bind the get location link
	$("#getLocation").click(function() {
		cleanAlerts();
		$("#searching").removeClass("hidden");
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				locationSuccess,
				locationFailed, {
					timeout: 10000
				}
			);
		} else {
			locationFailed();
		}
	});

	// When the find reps button is pressed
	$("#findReps").click(function() {
		cleanAlerts();
		$("#locating").removeClass('hidden');
		$.get(APIroot + 'legislators/locate', {
			zip: $("#zip").val(),
			per_page: 'all'
		}, function(data) {
			gotRepresentatives(data);
		}).fail(apiFail);
	});

	// Hide the two status changes when the page closes
	$('#findRepresentative').on('hidden.bs.modal', cleanAlerts);

	// On enter press, click continue
	$('#zip').keyup(function (e) {
		var val = $('#zip').val();
		var parent = $('#zip').parent();
		if (val === "") {
			parent.removeClass('has-error');
			parent.find('span').addClass('hidden');
		} else {
			parent.find('span').removeClass('hidden');
			if (/^\d{5}(-\d{4})?$/.test(parseInt(val, 10))) {
				parent.removeClass('has-error').addClass('has-success');
				parent.find('span').removeClass('glyphicon-remove').addClass('glyphicon-ok');
			} else {
				parent.removeClass('has-success').addClass('has-error');
				parent.find('span').removeClass('glyphicon-ok').addClass('glyphicon-remove');
			}
		}
		if (e.which == 13) {
			$('#findReps').click();
		}
	});


});