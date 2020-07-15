// ==UserScript==
// @name         Food Standards Agency download
// @namespace    sjorford@gmail.com
// @version      2020.07.15.0
// @author       Stuart Orford
// @match        https://ratings.food.gov.uk/open-data/en-GB
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/sjorford/js/master/xml-to-json.js
// @require      https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		.sjo-wrapper {position: fixed; bottom: 0px; left: 0px; width: 100%; z-index: 99999;}
		.sjo-box {border: 1px solid blue; width: auto; background-color: white; font-family: Calibri; font-size: 11pt; overflow: scroll; max-height: 200px;}
		.sjo-table td {margin: 0px; padding: 2px 5px;}
		.sjo-link {font-size: larger; line-height: 2;}
		.sjo-link:last-of-type {font-size: larger; float: right;}
		#inner_nav {display: none;}
	</style>`).appendTo('head');
	
	$('a').filter((i,e) => e.href.match(/ratings.food.gov.uk\/OpenDataFiles\/.*\.xml$/)).before('<input type="button" class="sjo-download" value="Download">')
	
	$('body').on('click', '.sjo-download', event => {
		var url = $(event.target).closest('td').find('a').attr('href').replace(/^https?:/, '');
		$.get(url, xml => {
			
			$('.sjo-box').remove();
			
			var table = $('<table class="sjo-table"></table>')
				.appendTo('body')
				.wrap('<div class="sjo-wrapper"></div>')
				.wrap('<div class="sjo-box"></div>')
				.click(function() {
					$(this).selectRange();
				});
			
			var data = XMLToJSON(xml);
			
			$.each(data.FHRSEstablishment.EstablishmentCollection.EstablishmentDetail, (i,e) => {
				var row = $('<tr></tr>').appendTo(table);
				$('<td></td>').text(e.FHRSID).appendTo(row);
				$('<td></td>').text(e.BusinessName).appendTo(row);
				$('<td></td>').text(e.BusinessType).appendTo(row);
				$('<td></td>').text(e.AddressLine1).appendTo(row);
				$('<td></td>').text(e.AddressLine2).appendTo(row);
				$('<td></td>').text(e.AddressLine3).appendTo(row);
				$('<td></td>').text(e.PostCode).appendTo(row);
			});
			
		});
		
	});
});
