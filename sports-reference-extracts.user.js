// ==UserScript==
// @name         Sports Reference extracts
// @namespace    sjorford@gmail.com
// @version      2020.05.02.0
// @author       Stuart Orford
// @match        https://www.pro-football-reference.com/years/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		.sjo-wrapper {display: inline-block; width: auto !important; margin: 1em;}
		.sjo-box {border: 1px solid blue; width: auto; background-color: white; font-family: Calibri; font-size: 11pt; overflow: scroll; max-height: 200px;}
		.sjo-table td {margin: 0px; padding: 2px 5px;}
		.sjo-link {font-size: larger; line-height: 2;}
		.sjo-link:last-of-type {font-size: larger; float: right;}
		#inner_nav {display: none;}
	</style>`).appendTo('head');
	
	// Add export table
	var table = $('<table class="sjo-table"></table>')
		.insertBefore('#content')
		.wrap('<div class="sjo-wrapper"></div>')
		.wrap('<div class="sjo-box"></div>')
		.click(function() {
			selectRange(this);
		});
	
	var path = window.location.pathname;
	var year = window.location.pathname.match(/\d{4}/)[0] - 0;
	$(`<a class="sjo-link" href="${path.replace(year, year - 1)}">← ${year - 1}</a>`).insertBefore('.sjo-box');
	$(`<a class="sjo-link" href="${path.replace(year, year + 1)}">${year + 1} →</a>`).insertBefore('.sjo-box');
	
	var sports = {'www.pro-football-reference.com': ['FB', 'NFL']}
	var [sport, league] = sports[window.location.hostname];
	var division = '';
	
	$('.content_grid').first().find('tbody tr').each((i,e) => {
		
		var tr = $(e);
		var cells = tr.find('td, th');
		
		if (tr.is('.thead')) {
			division = tr.text();
		} else {
			
			var team = cells.eq(0).text().replace(/[\*\+]$/, '');
			
			var playoffs = '';
			var playoffCell = $('#playoff_results td').filter((i,e) => e.innerText.trim() == team).last();
			if (playoffCell[0]) {
				if (playoffCell[0].cellIndex <= 3)
					playoffs = 'Champ';
				else
					playoffs = playoffCell.closest('tr').find('th, td').first().text();
			}
			
			var trNew = $('<tr></tr>').appendTo(table);
			$('<td></td>').text(year).appendTo(trNew);
			$('<td></td>').text(sport).appendTo(trNew);
			$('<td></td>').text(league).appendTo(trNew);
			$('<td></td>').text(division).appendTo(trNew);
			$('<td></td>').text(team).appendTo(trNew);
			$('<td></td>').text(cells.eq(1).text()).appendTo(trNew);
			$('<td></td>').text(cells.eq(2).text()).appendTo(trNew);
			$('<td></td>').text(cells.eq(3).text()).appendTo(trNew);
			$('<td></td>').text(playoffs).appendTo(trNew);
			
		}
		
	});
	
	function selectRange(element) {
		var range = document.createRange();
		range.selectNodeContents($(element).get(0));
		var selection = window.getSelection();        
		selection.removeAllRanges();
		selection.addRange(range);
	}
	
});
