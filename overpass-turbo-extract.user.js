// ==UserScript==
// @name         Overpass Turbo extract
// @namespace    sjorford@gmail.com
// @version      2020.08.02.0
// @author       Stuart Orford
// @match        https://overpass-turbo.eu/
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	window.sjo = {getCongletonNodes: getCongletonNodes};
	
	function getCongletonNodes() {
		var url = 'https://overpass-api.de/api/interpreter'
		var data = {data: '[out:json][timeout:25];\n(\n  node[~\".\"~\".\"](53.14131327000133,-2.2791481018066406,53.186956172412394,-2.148771286010742);\n);\nout body;\n>;\nout skel qt;'};
		$.post(url, data, parseData)
	}
	
	function parseData(data) {
		console.log(data);
		
		$(`<style>
			.sjo-wrapper {position: fixed; bottom: 0px; left: 0px; width: 100%; z-index: 999999;}
			.sjo-box {border: 1px solid blue; width: auto; background-color: white; font-family: Calibri; font-size: 11pt; overflow: scroll; max-height: 200px;}
			.sjo-table td {margin: 0px; padding: 2px 5px;}
		</style>`).appendTo('head');

		var table = $('<table class="sjo-table"></table>')
			.appendTo('body')
			.wrap('<div class="sjo-wrapper"></div>')
			.wrap('<div class="sjo-box"></div>')
			.click(function() {
				$(this).selectRange();
			});
		var thead = $('<thead></thead>').appendTo(table);
		var tbody = $('<tbody></tbody>').appendTo(table);
		var header = $('<tr></tr>').appendTo(thead);
		
		var tags = 'name	addr:housename	addr:housenumber	addr:street	addr:city	addr:postcode	phone	website	facebook	shop	amenity	tourism	brand	brand:wikidata	brand:wikipedia	fhrs:id	collection_times	ref	power	upload_tag	place	denomination	religion	traffic_calming	emergency	postal_code	waste	generator:type	generator:source	generator:method	generator:output:electricity	location	bicycle	is_in	barrier	foot	motor_vehicle	parking	access	opening_hours	noexit	uk_postcode_centroid	highway	crossing	crossing_ref	kerb	tactile_paving	direction	local_ref	bench	shelter	alt_name	bus	public_transport	route_ref	wheelchair	stile	ele	wpt_description	wpt_symbol	horse	motorcar	motorcycle	entrance	natural	maxspeed	speed_camera_type	fee	operator	substation	email	opening_hours:covid19	cuisine	payment:cash	steps	information	waterway	contact:facebook	dance:style	dance:teaching	leisure	backrest	capacity	park_ride	supervised	delivery	drive_through	outdoor_seating	smoking	takeaway	dispensing	healthcare	office	historic	inscription	beauty	craft	man_made	memorial	building	club	short_name	healthcare:speciality	brewery	network	railway	ref:crs	wikipedia	wikidata	train	bicycle_parking	covered	vending	communication:mobile_phone	tower:type	material	openbenches:id	construction	defibrillator:location	indoor	product	denotation	start_date	artwork_type	recycling:clothes	recycling_type	self_service	clothes	proposed	bollard	agrarian	official_name	water	sport	source	source:name	source:addr	source:addr:postcode	note	fixme'.split('\t');
		var tagsNope = ['created_by', 'upload_tag'];
		
		$.each(tags, (i,tag) => $('<th></th>').text(tag).appendTo(header));
		
		$.each(data.elements, (i,node) => {
			var found = false;
			var row;
			
			$.each(node.tags, (tag,value) => {
				if (tagsNope.indexOf(tag) < 0 && !(tag.match(/^naptan:/))) {
					
					if (!found) {
						row = $('<tr>' + '<td></td>'.repeat(tags.length) + '</tr>').appendTo(table);
						found = true;
					}
					
					var col = tags.indexOf(tag);
					if (col < 0) {
						tags.push(tag);
						$('<th></th>').text(tag).appendTo(header);
						row.append('<td></td>');
						col = tags.length - 1;
					}
					
					row[0].cells[col].innerText = value.replace(/\s+/g, ' ').trim();
					
				}
			});
		});
		
	}
	
});
})(jQuery.noConflict());
