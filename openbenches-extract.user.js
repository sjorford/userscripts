﻿// ==UserScript==
// @name           OpenBenches extract
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.03.26.0
// @match          https://openbenches.org/
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	var threshold = 1.1; // km
	
	window.sjo = window.sjo || {};
	
	window.sjo.extractBenches = extractBenches;
	console.log("registered sjo.extractBenches()");

	window.sjo.distanceLatLon = getDistanceFromLatLonInKm;
	console.log("registered sjo.distanceLatLon(lat1,lon1,lat2,lon2)");

	window.sjo.drawCircles = drawCircles;
	console.log("registered sjo.drawCircles()");

	function extractBenches() {

		var table = $('<table class="sjo-table"></table>').appendTo('body');
		
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
		
		// Calculate the distance between all benches
		for (var i = 0; i < allBenches.length; i++) {
			for (var j = i + 1; j < allBenches.length; j++) {
				
				var distance;
				if (Math.abs(allBenches[i].lat - allBenches[j].lat) > 1 
					|| Math.abs(allBenches[i].lon - allBenches[j].lon) > 1) {
					distance = Infinity;
				} else {
					distance = getDistanceFromLatLonInKm(
						allBenches[i].lat, allBenches[i].lon,
						allBenches[j].lat, allBenches[j].lon);
				}
				
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
			
			// Write the group to the table
			$.each(groupBenches, (index, bench) => {
				
				var row = $('<tr></tr>').appendTo('table');
				
				var text = bench.text.replace(/&amp;/g, '&').replace(/(<br \/>|\s)+/g, ' ').trim();
				if (text.charAt(0) == '"') {
					text = '="' + text.replace(/"/g, '""') + '"';
				}
				var textLink = $('<a></a>').text(text).attr('href', `https://openbenches.org/bench/${bench.id}/`);
				
				$('<td></td>').text(groupBenches[0].id).appendTo(row);
				$('<td></td>').text(bench.id).appendTo(row);
				$('<td></td>').text(bench.lat.toFixed(6)).appendTo(row);
				$('<td></td>').text(bench.lon.toFixed(6)).appendTo(row);
				$('<td></td>').append(textLink).appendTo(row);
				$('<td></td>').text(nextClosest.toFixed(3)).appendTo(row);
				
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
	
	function drawCircles() {
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