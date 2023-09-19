// ==UserScript==
// @name           Wikipedia general election candidates
// @namespace      sjorford@gmail.com
// @version        2023.09.19.0
// @author         Stuart Orford
// @match          https://en.wikipedia.org/wiki/Candidates_in_the_next_United_Kingdom_general_election
// @match          https://en.wikipedia.org/wiki/Candidates_in_the_next_United_Kingdom_general_election#*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://cdn.jsdelivr.net/npm/luxon@3.4.3/build/global/luxon.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.wikitable.sortable {table-layout: fixed; width: 100%; font-size: 75%;}
		.sjo-recent {background-color: gold;}
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
	
	$('cite').find("*").addBack().contents().each((i,e) => {
		if (e.nodeType != Node.TEXT_NODE) return;
		if ($(e).parents().is('.reference-accessdate')) return;
		
		var dateMatch = e.nodeValue.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2} [JFMAJSOND][a-z]+ \d{4})/);
		if (!dateMatch) return;
		
		var dateFormat = dateMatch[1] ? 'yyyy-MM-dd' : dateMatch[2] ? 'd MMMM yyyy' : null;
		var date = luxon.DateTime.fromFormat(dateMatch[0], dateFormat);
		
		var days = luxon.DateTime.now().diff(date, 'days').values.days;
		if (days < 30) {
			$(e).closest('li').find('.mw-cite-backlink a').each((i,e) => {
				var id = e.href.match(/#cite_ref.*$/)[0];
				$(`sup${id}`).closest('td').addClass('sjo-recent');
			});
		}
		
	});
	
});
})(jQuery);
