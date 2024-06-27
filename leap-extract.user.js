// ==UserScript==
// @name           LEAP extract
// @namespace      sjorford@gmail.com
// @version        2024.06.27.1
// @author         Stuart Orford
// @match          http://www.andrewteale.me.uk/leap/results/*
// @match          https://www.andrewteale.me.uk/leap/results/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-wrapper {max-height: 10em; overflow-y: scroll; border: 1px solid black;}
	</style>`).appendTo('head');
	
	var outputTable = $('<table></table>').prependTo('.content')
			.wrap('<div class="sjo-wrapper"></div>').click(event => outputTable.selectRange());
	
	var year = $('h1').text().match(/\d{4}/)[0];
	var council = $('h2').text();
	
	$('h4:has(a)').each((i,e) => {
		
		var h4 = $(e);
		var ward = h4.text().replace(/\[.*\]/, '').trim();
		var seats = 1;
		if (ward.match(/\(\d+\)/)) {
			seats = ward.match(/\((\d+)\)/)[1] - 0;
			ward = ward.replace(/\(\d+\)/, '').trim();
		}
		
		var votesPrev = '';
		var rank = '';
		
		h4.next('table').find('tr').each((i,e) => {
			
			var name  = e.cells[0].textContent.trim();
			var party = e.cells[1].textContent.trim();
			var votes = e.cells[2].textContent.trim();
			var elected = (i + 1) <= seats ? 'elected' : '';
			if (votes != votesPrev) rank = i + 1;
			
			var outputRow = $('<tr></tr>').appendTo(outputTable);
			$('<td></td>').appendTo(outputRow).text(year);
			$('<td></td>').appendTo(outputRow).text(council);
			$('<td></td>').appendTo(outputRow).text(ward);
			$('<td></td>').appendTo(outputRow).text(name);
			$('<td></td>').appendTo(outputRow).text(party);
			$('<td></td>').appendTo(outputRow).text(votes);
			$('<td></td>').appendTo(outputRow).text(rank);
			$('<td></td>').appendTo(outputRow).text(elected);
			
			votesPrev = votes;
			
		});
		
		// Re-sort wards
		var sortedRows = outputTable.find('tr').toArray().sort((a,b) => {
			var wardA = a.cells[2].textContent.trim();
			var wardB = b.cells[2].textContent.trim();
			return wardA < wardB ? -1 : wardA > wardB ? 1 : 0;
		});
		
		outputTable.append(sortedRows);
		
	});
	
});
})(jQuery.noConflict());
