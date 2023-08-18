// ==UserScript==
// @name           Wikipedia general election candidates
// @namespace      sjorford@gmail.com
// @version        2023.08.18.0
// @author         Stuart Orford
// @match          https://en.wikipedia.org/wiki/Candidates_in_the_next_United_Kingdom_general_election
// @match          https://en.wikipedia.org/wiki/Candidates_in_the_next_United_Kingdom_general_election#*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.wikitable.sortable {table-layout: fixed; width: 100%; font-size: 70%;}
	</style>`).appendTo('head');
	
	$('.wikitable.sortable').each((i,e) => {
		var table = $(e);
		var colgroup = $('<colgroup></colgroup>').prependTo(table);
		var numCols = table.find('th').length + 2;
		for (var c = 0; c < numCols; c++) {
			var col = $('<col>').appendTo(colgroup);
			if (c == numCols - 3) {
				col.css({width: '1em'});
			}
		}
	});
	
	$('.mw-parser-output sup').before('&thinsp;');
	
});
})(jQuery);
