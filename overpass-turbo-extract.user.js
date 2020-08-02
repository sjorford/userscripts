// ==UserScript==
// @name         Overpass Turbo extract
// @namespace    sjorford@gmail.com
// @version      2020.08.02.2
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
		var url = 'https://overpass-api.de/api/interpreter';
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
		
		var tags = 'shop	amenity	craft	tourism	leisure	office	healthcare	emergency	power	highway	traffic_calming	barrier	natural	name	brand	brand:wikipedia	brand:wikidata	operator	opening_hours	opening_hours:covid19	fee	addr:housename	addr:housenumber	addr:street	addr:city	addr:postcode	phone	email	website	facebook	takeaway	delivery	cuisine	fhrs:id	collection_times	ref	waste	crossing	crossing_ref	kerb	tactile_paving	generator:type	generator:source	generator:method	generator:output:electricity	location'.split('\t');
		
		$.each(tags, (i,tag) => $('<th></th>').text(tag).appendTo(header));
		
		$.each(data.elements, (i,node) => {
			
			var found = false;
			var values = new Array(tags.length);
			var other = '';
			
			$.each(node.tags, (tag,value) => {
				
				if (tag.match(/^(created_by|upload_tag|naptan|source)(:|$)/)) return;
				if (!tag.match(/^addr:/)) found = true;
				var cleanValue = value.replace(/\s+/g, ' ').trim();
				
				var col = tags.indexOf(tag);
				if (col >= 0) {
					values[col] = cleanValue;
				} else {
					other += ' [' + tag + '] ' + cleanValue;
				}
				
			});
			
			if (found) {
				values.push(other.trim());
				var row = $('<tr></tr>').appendTo(table);
				$.each(values, (i,value) => $('<td></td>').text(value).appendTo(row));
			}
			
		});
		
	}
	
});
})(jQuery.noConflict());
