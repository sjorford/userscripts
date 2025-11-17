// ==UserScript==
// @name           OpenStreetMap history
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2025.11.17.0
// @match          https://www.openstreetmap.org/*
// @grant          none
// ==/UserScript==

$(function() {
	
	/*
	$(`<style class="sjo-styles">
		.sjo-history-added   th, .sjo-history-added   td {background-color: #73ca73 !important;}
		.sjo-history-removed th, .sjo-history-removed td {background-color: #cca0a0 !important;}
		.sjo-history-changed th {background-color: #addd44 !important;}
		.sjo-history-bearing {display: inline-block;}
	</style>`).appendTo('head');
	*/
	
	var timer = window.setInterval(markupHistory, 500);
	
	function markupHistory() {
		
	//var log = $('.browse-node, .browse-way, .browse-relation').not('.sjo-processed');
	var log = $('#element_versions_list > div'); //.not('.sjo-processed');
	log.addClass('sjo-processed').each((i,e) => {
		
		//var thisTable = log.eq(i).find('.browse-tag-list');
		//if (thisTable.length == 0) {
		//	thisTable = $('<table class="browse-tag-list"></table>').appendTo(e);
		//}
		var removedTable;
		
		var thisLogRows = log.eq(i).find('.browse-tag-list tr');
		var prevLogRows = log.eq(i+1).find('.browse-tag-list tr');
		
		var thisLog = thisLogRows.toArray().map(e => ({key: e.cells[0].innerText.trim(), value: e.cells[1].innerText}));
		var prevLog = prevLogRows.toArray().map(e => ({key: e.cells[0].innerText.trim(), value: e.cells[1].innerText}));
		
		var θ = 0, π = 0;
		while (θ < thisLog.length || π < prevLog.length) {
			
			if (π >= prevLog.length || (θ < thisLog.length && thisLog[θ].key < prevLog[π].key)) {
				thisLogRows.eq(θ).addClass('sjo-history-added')
					.find('*').css({backgroundColor: '#73ca73'});
				θ++;
			} else if (θ >= thisLog.length || (π < prevLog.length && prevLog[π].key < thisLog[θ].key)) {
				if (!removedTable) {
					removedTable = $('<table class="mb-0 browse-tag-list table align-middle"></table>').appendTo(e).before('<h5>Removed:</h5>')
						.wrap('<div class="mb-3 border border-secondary-subtle rounded overflow-hidden"></div>').append('<tbody></tbody>').find('tbody');
				}
				$('<tr></tr>').html(prevLogRows.eq(π).html()).addClass('sjo-history-removed').appendTo(removedTable)
					.find('*').css({backgroundColor: '#cca0a0'});
				π++;
			} else {
				if (thisLog[θ].key === prevLog[π].key && thisLog[θ].value !== prevLog[π].value) {
					thisLogRows.eq(θ).addClass('sjo-history-changed')
						.find('*').css({backgroundColor: '#addd44'});
				}
				θ++;
				π++;
			}
			
		}
		
		var thisGeo = log.eq(i).find('.latitude').closest('li');
		var prevGeo = log.eq(i+1).find('.latitude').closest('li');
		if (thisGeo.length > 0 && prevGeo.length > 0) {
			var thisCoords = {lat: thisGeo.find('.latitude').text().trim()-0, lon: thisGeo.find('.longitude').text().trim()-0};
			var prevCoords = {lat: prevGeo.find('.latitude').text().trim()-0, lon: prevGeo.find('.longitude').text().trim()-0};
			if (!(thisCoords.lat == prevCoords.lat && thisCoords.lon == prevCoords.lon)) {
				var chg = geoChange(prevCoords.lat, prevCoords.lon, thisCoords.lat, thisCoords.lon);
				var dist = chg.distance < 1000 ? chg.distance.toPrecision(2)-0 + 'm' : (chg.distance / 1000).toPrecision(2)-0 + 'km';
				$('<span class="sjo-history-bearing">🡅</span>')
					.css({transform: `rotate(${chg.bearing}deg)`})
					.appendTo(thisGeo)
					.after(` ${dist}`);
			}
		}
		
	});
	
	}
	
	// https://www.movable-type.co.uk/scripts/latlong.html
	function geoChange(lat1, lon1, lat2, lon2) {
		
		const R = 6371e3; // metres
		
		const φ1 = lat1 * Math.PI/180; // φ, λ in radians
		const φ2 = lat2 * Math.PI/180;
		const λ1 = lon1 * Math.PI/180;
		const λ2 = lon2 * Math.PI/180;

		const Δφ = (lat2-lat1) * Math.PI/180;
		const Δλ = (lon2-lon1) * Math.PI/180;
		const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + 
			  Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		const d = R * c; // in metres
		
		const y = Math.sin(λ2-λ1) * Math.cos(φ2);
		const x = Math.cos(φ1) * Math.sin(φ2) - 
			  Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2-λ1);
		const θ = Math.atan2(y, x);
		const b = (θ*180/Math.PI + 360) % 360; // in degrees

		return {distance: d, bearing: b};
	}
	
});
