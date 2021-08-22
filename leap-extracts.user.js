// ==UserScript==
// @name           LEAP extracts
// @namespace      sjorford@gmail.com
// @version        2021.08.21.0
// @author         Stuart Orford
// @match          https://www.andrewteale.me.uk/leap/elections-index/
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-table td {font-size: 9pt !important; margin: 0px; padding: 2px 5px;}
		.sjo-box {display: inline-block; border: 1px solid blue; background-color: white; font-size: 8pt; overflow: scroll; max-height: 200px;}
	</style>`).appendTo('head');
	
	// Add export table
	var outputTable = $('<table class="sjo-table"></table>')
		.appendTo('body')
		.wrap('<div class="sjo-box"></div>')
		.click(event => outputTable.selectRange());
	
	// Extract by-elections into table
	$('h4 + ul > li').each((i,e) => {
		var byItem = $('ul > li', e);
		if (byItem.length == 0) return;
		
		var council = e.innerText.match(/(.*):/)[1].trim();
		var byText = byItem.text().replace(/\s+/g, ' ');
		var byArray = byText.match(/:(.*)/)[1].split('—');
		$.each(byArray, (i,byText) => {
			var byMatch = byText.trim().match(/(\d+)\w\w( \w+ \d{4}) \((.+)\)/); 
			var date = byMatch[1] + byMatch[2];
			var seats = byMatch[3].split(';');
			$.each(seats, (i,seat) => {
			var outputRow = $('<tr></tr>').appendTo(outputTable);
				$('<td></td>').text(date).appendTo(outputRow);
				$('<td></td>').text(council).appendTo(outputRow);
				$('<td></td>').text(seat.trim()).appendTo(outputRow);
			});
		});
		
	});
	
});
})(jQuery.noConflict());
