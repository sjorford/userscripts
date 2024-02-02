// ==UserScript==
// @name           Wikipedia general election candidates
// @namespace      sjorford@gmail.com
// @version        2024.02.02.0
// @author         Stuart Orford
// @match          https://en.wikipedia.org/wiki/Candidates_in_the_next_United_Kingdom_general_election
// @match          https://en.wikipedia.org/wiki/Candidates_in_the_next_United_Kingdom_general_election#*
// @grant          none
// @require        https://cdn.jsdelivr.net/npm/luxon@3.4.3/build/global/luxon.min.js
// ==/UserScript==

var timer = window.setInterval(jQueryCheck, 100);

function jQueryCheck() {
	if (!$) return;
	window.clearInterval(timer);
	$('<script src="https://sjorford.github.io/js/sjo-jq.js"></script>').appendTo('head');
	
	$(`<style>
		.wikitable.sortable {table-layout: fixed; width: 100%; font-size: 75%;}
		.sjo-recent {background-color: gold;}
	</style>`).appendTo('head');
	
	$('.wikitable.sortable').each((i,e) => {
		
		var table = $(e).indexCells();
		var numCols = table.numCols();
		
		// Column widths
		var colgroup = $('<colgroup></colgroup>').prependTo(table).append('<col>'.repeat(numCols));
		colgroup.find('col').eq(-3).css({width: '1em'});
		colgroup.find('col').eq(-2).css({width: '4em'});
		
		// Shorten incumbent party names
		table.find('tbody tr').each((i,e) => {
			var cell = $(e).find('td').filter((i,e) => $(e).data('sjo-col-min') == numCols - 2);
			if (cell.attr('colspan')) return;
			var text = cell.text().trim();
			switch (true) {
				case text == 'Conservative':      cell.text('Con'); break;
				case text == 'Labour':            cell.text('Lab'); break;
				case text == 'Liberal Democrats': cell.text('LD');  break;
				case text == 'Plaid Cymru':       cell.text('PC');  break;
				case text.length <= 5:            cell.text(text);  break; // keep abbreviations but remove links
				default:                          cell.text('Oth'); break;
			}
		});
		
	});
	
	// Separate references
	$('.mw-parser-output sup').before('&thinsp;');
	
	// Highlight recent selections
	$('cite').find("*").addBack().contents().each((i,e) => {
		if (e.nodeType != Node.TEXT_NODE) return;
		if ($(e).parents().is('.reference-accessdate')) return;
		
		var dateMatch = e.nodeValue.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2} [JFMAJSOND][a-z]+ \d{4})/);
		if (!dateMatch) return;
		
		var dateFormat = dateMatch[1] ? 'yyyy-MM-dd' : dateMatch[2] ? 'd MMMM yyyy' : null;
		var date = luxon.DateTime.fromFormat(dateMatch[0], dateFormat);
		
		var days = luxon.DateTime.now().diff(date, 'days').values.days;
		if (days < 7) {
			$(e).closest('li').find('.mw-cite-backlink a').each((i,e) => {
				var id = e.href.match(/#cite_ref.*$/)[0];
				$(`sup${id}`).closest('td').addClass('sjo-recent');
			});
		}
		
	});
	
}
