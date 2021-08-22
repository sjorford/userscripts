// ==UserScript==
// @name           Wikipedia extract league results grid
// @namespace      sjorford@gmail.com
// @version        2021.08.18.0
// @author         Stuart Orford
// @match          https://en.wikipedia.org/wiki/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style class="sjo-style">
		.sjo-table td {font-size: 9pt !important; margin: 0px; padding: 2px 5px;}
		.sjo-box {display: inline-block; border: 1px solid blue; background-color: white; font-size: 8pt; overflow: scroll; max-height: 200px;}
	</style>`).appendTo('head');
	
	// Merge columns in league table
	var leagueTable = $('.wikitable th').filter((i,e) => e.innerText.trim() == 'GD').closest('.wikitable').first();
	console.log(leagueTable);
	mergeColumns(leagueTable, 'HW',  'AW',  'W');
	mergeColumns(leagueTable, 'HD',  'AD',  'D');
	mergeColumns(leagueTable, 'HL',  'AL',  'L');
	mergeColumns(leagueTable, 'HGF', 'AGF', 'F');
	mergeColumns(leagueTable, 'HGA', 'AGA', 'A');
	
	// Replace fancy hyphens in GD column
	leagueTable.find('td').each((i,e) => {
		if (e.innerText.trim().match(/^−\d+$/)) {
			e.innerText = e.innerText.trim().replace(/−/, '-');
		}
	});
	
	function mergeColumns(table, heading1, heading2, newHeading) {
		var headings = table.find('tr:first-of-type th').toArray().map(e => e.innerText.trim());
		var col1 = headings.indexOf(heading1);
		var col2 = headings.indexOf(heading2);
		if (col1 < 0 || col2 < 0) return;
		
		table.find('tr').each((i,e) => {
			var cells = $('th, td', e);
			
			if (i == 0) {
				cells.eq(col1).text(newHeading);
				cells.eq(col2).remove();
				return;
			}
			
			var value1 = cells.eq(col1).text() - 0;
			var value2 = cells.eq(col2).text() - 0;
			cells.eq(col1).text(value1 + value2);
			cells.eq(col2).remove();
			
		});
		
	}
	
	// Add export table
	var outputTable = $('<table class="sjo-table"></table>')
		.appendTo('body')
		.wrap('<div class="sjo-box"></div>')
		.click(event => outputTable.selectRange());
	
	var season = $('#firstHeading').text().trim().match(/(\S+) (.*)/);
	
	var resultsGrid = $('.wikitable th').filter((i,e) => e.innerText.trim() == "Home \\ Away").closest('.wikitable').first();
	var headerCells = resultsGrid.find('tr').first().find('th').slice(1);
	var bodyRows = resultsGrid.find('tr:has(td)');
	bodyRows.each((row,e) => {
		var tr = $(e);
		tr.find('td').each((col,e) => {
			if (row == col) return;
			
			var score = e.innerText.trim().match(/^(\d+)–(\d+)$/);
			var homeTeamName = tr.find('th').text().trim();
			var homeTeamAbbr = headerCells.eq(row).text().trim();
			var awayTeamName = bodyRows.eq(col).find('th').text().trim();
			var awayTeamAbbr = headerCells.eq(col).text().trim();
			
			var outputRow = $('<tr></tr>').appendTo(outputTable);
			$('<td></td>').text(season[1]).appendTo(outputRow);
			$('<td></td>').text(season[2]).appendTo(outputRow);
			$('<td></td>').text(homeTeamAbbr).appendTo(outputRow);
			$('<td></td>').text(homeTeamName).appendTo(outputRow);
			$('<td></td>').text(awayTeamAbbr).appendTo(outputRow);
			$('<td></td>').text(awayTeamName).appendTo(outputRow);
			$('<td></td>').text(score[1]).appendTo(outputRow);
			$('<td></td>').text(score[2]).appendTo(outputRow);
			
		});
	});
	
});
})(jQuery.noConflict());
