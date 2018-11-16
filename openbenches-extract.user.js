// ==UserScript==
// @name           OpenBenches extract
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.11.16.0
// @match          https://openbenches.org/*
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

jQuery.noConflict();
jQuery(function() {
	var $ = jQuery;
	
	$(`<style>
		.sjo-table {background-color: white; border-collapse: collapse; font-size: 9pt;}
		.sjo-table td {border: 1px solid black; padding: 0.25em;}
		.sjo-table a {text-decoration: none;}
		.sjo-table a:hover {text-decoration: underline;}
		a[href="/login/"] {background-color: yellow; padding: 0.5em; border: 2px solid black; border-radius: 0.25em;}
		form[action="/search/"] h2 {display: none;}
	</style>`).appendTo('head');
	
	var threshold = 1.5; // km
	
	if (window.location.href.split('#')[0] == 'https://openbenches.org/') {
		formatMainPage();
	} else if (window.location.href.indexOf('/openbenches.org/bench/') > 0) {
		formatBenchPage();
	}
	
	function formatMainPage() {
		
		// Resize map
		$('#map').css({width: 'calc(100% - 100px)', height: '500px'});
		map.invalidateSize();
		
		var buttonBar = $('<div class="button-bar"></div>').insertBefore('footer');
		$('<a href="#" class="hand-drawn">Draw circles</a>').click(drawCircles).appendTo(buttonBar);
		buttonBar.append(' ');
		$('<a href="#" class="hand-drawn">Extract benches</a>').click(extractBenches).appendTo(buttonBar);
		buttonBar.append(' ');
		$('<a href="/leaderboard" class="hand-drawn">Leaderboard</a>').appendTo(buttonBar);
		
		// Fix number of benches
		var header = $('h2[itemprop="description"]');
		var headerNumber = header.text().match(/\d+,\d+/)[0].replace(',', '') - 0;
		if (headerNumber != benches.features.length) {
			var newNumber = benches.features.length.toString().replace(/(\d{3})$/, ',$1');
			header.html(header.html().replace(/(\d+,\d+)/, '<s>$1</s> ' + newNumber)); 
		}
		
		
	}
	
	function formatBenchPage() {
		
		var id = window.location.href.match(/\/bench\/(\d+)/)[1] - 0;
		
		var buttonBar = $('<div class="button-bar"></div>')
			.append(`<a href="/bench/${id-1}/" class="hand-drawn">Prev</a>`)
			.append(' ')
			.append('<form style="display: inline-block;" action="/bench/" method="post"><input id="random" name="random" value="random" type="hidden"><input class="hand-drawn" value="Random" type="submit"></form>')
			.append(' ')
			.append(`<a href="/bench/${id+1}/" class="hand-drawn">Next</a>`)
			.insertBefore('footer');
		
	}
	
	function extractBenches(event) {
		if (event) event.preventDefault();

		var table = $('<table class="sjo-table"></table>')
			.click(event => event.target.tagName == 'A' ? true : table.selectRange())
			.appendTo('body');
		
		// Parse list of benches
		var allBenches = benches.features.map(function(bench) {
			return {
				id: bench.id,
				lat: bench.geometry.coordinates[1],
				lon: bench.geometry.coordinates[0],
				text: bench.properties.popupContent,
				distArray: {}
			};
		});
		
		var maxLatDifference = 0.1;
		var maxLonDifference = 0.3;
		//var maxDistance = 10;
		// 1 degree of latitude ~ 111km
		
		// Calculate the distance between all benches
		for (var i = 0; i < allBenches.length; i++) {
			for (var j = i + 1; j < allBenches.length; j++) {
				
				// Limit distance
				var distance;
				if (Math.abs(allBenches[i].lat - allBenches[j].lat) > maxLatDifference
					|| Math.abs(allBenches[i].lon - allBenches[j].lon) > maxLonDifference) {
					distance = Infinity;
				} else {
					distance = getDistanceFromLatLonInKm(
						allBenches[i].lat, allBenches[i].lon,
						allBenches[j].lat, allBenches[j].lon);
				}
				//if (distance > maxDistance) distance = Infinity;
				
				allBenches[i].distArray[allBenches[j].id] = distance;
				allBenches[j].distArray[allBenches[i].id] = distance;
				
			}
		}
		
		var todoBenches = allBenches.slice(0);
		//todoBenches = todoBenches.slice(0, 100);
		var groupBenches, otherBenches;
		
		while (todoBenches.length > 0) {

			// Start a new group
			groupBenches = todoBenches.splice(0, 1);
			
			// Loop through benches in group
			for (var i = 0; i < groupBenches.length; i++) {
				
				otherBenches = [];
				
				// Find more benches close to this bench
				for (var j = 0; j < todoBenches.length; j++) {
					if (groupBenches[i].distArray[todoBenches[j].id] <= threshold) {
						groupBenches.push(todoBenches[j]);
					} else {
						otherBenches.push(todoBenches[j]);
					}
				}
				
				todoBenches = otherBenches;
			}
			
			// Find the next closest bench
			/*
			var nextClosest = Infinity;
			for (var i = 0; i < groupBenches.length; i++) {
				for (var j = 0; j < allBenches.length; j++) {
					if (!allBenches[j]) continue;
					if (i != j && groupBenches.indexOf(allBenches[j]) < 0 
						&& groupBenches[i].distArray[allBenches[j].id] < nextClosest) {
						nextClosest = groupBenches[i].distArray[allBenches[j].id];
					}
				}
			}
			*/
			
			// Write the group to the table
			$.each(groupBenches, (index, bench) => {
				
				var row = $('<tr></tr>').appendTo('table');
				
				var text = bench.text.replace(/(<br \/>)/g, '\n');
				if (text.length < 128) {
					text = text.replace(/…$/, '');
				}
				text = text.replace(/\s+/g, ' ').trim()
					.replace(/&amp;/g, '&')
					.replace(/&quot;/g, '"')
					.replace(/&(a(m(p)?)?)?…$/, '&…')
					.replace(/\s+…$/, '…');
				if (text.charAt(0) == '"' || text.charAt(0) == "'") {
					text = '="' + text.replace(/"/g, '""') + '"';
				}
				var textLink = $('<a></a>').text(text).attr('href', `https://openbenches.org/bench/${bench.id}/`);
				
				$('<td></td>').text(bench.id).appendTo(row);
				$('<td></td>').text(groupBenches[0].id).appendTo(row);
				$('<td></td>').text(bench.lat.toFixed(6)).appendTo(row);
				$('<td></td>').text(bench.lon.toFixed(6)).appendTo(row);
				$('<td></td>').append(textLink).appendTo(row);
				//$('<td></td>').text(nextClosest == Infinity ? '-' : nextClosest.toFixed(3)).appendTo(row);
				
			});

		}

	}
	
	function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = deg2rad(lat2-lat1);  // deg2rad below
		var dLon = deg2rad(lon2-lon1); 
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2)
		; 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	}

	function deg2rad(deg) {
		return deg * (Math.PI/180);
	}
	
	function drawCircles(event) {
		if (event) event.preventDefault();
		
		$.each(benches.features, (index, bench) => {
			L.circle([bench.geometry.coordinates[1], bench.geometry.coordinates[0]], {
				color: 'red',
				//fillColor: 'red',
				fillOpacity: 0,
				radius: threshold / 2 * 1000,
				weight: 1,
				opacity: 0.5,
			}).addTo(map);
		});
		
	}
	
});
