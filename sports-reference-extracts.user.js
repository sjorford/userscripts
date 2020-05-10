// ==UserScript==
// @name         Sports Reference extracts
// @namespace    sjorford@gmail.com
// @version      2020.05.10.1
// @author       Stuart Orford
// @match        https://www.pro-football-reference.com/years/*/
// @match        https://www.baseball-reference.com/leagues/MLB/*-standings.shtml
// @match        https://www.basketball-reference.com/leagues/*.html
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
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
			$(this).selectRange();
		});
	
	var path = window.location.pathname;
	var year = window.location.pathname.match(/\d{4}/)[0] - 0;
	$(`<a class="sjo-link" href="${path.replace(year, year - 1)}">← ${year - 1}</a>`).insertBefore('.sjo-box');
	$(`<a class="sjo-link" href="${path.replace(year, year + 1)}">${year + 1} →</a>`).insertBefore('.sjo-box');
	
	var sports = {
		'www.pro-football-reference.com': football,
		'www.baseball-reference.com':     baseball,
		'www.basketball-reference.com':   basketball,
	};
	
	var fn = sports[window.location.hostname];
	
	var data = fn.call();
	
	$.each(data, (i,e) => {
		
		$('<tr></tr>').appendTo(table)
			.addCell(e.season || year)
			.addCell(e.league)
			.addCell(e.division)
			.addCell(e.team)
			.addCell(e.W)
			.addCell(e.L)
			.addCell(e.T)
			.addCell(e.playoffs);
		
	});
	
	// ================================================================
	
	function football() {
		
		var data = [];
		var division = '';
		
		$('.content_grid').first().find('.table_outer_container tbody tr').each((i,e) => {
			
			var tr = $(e);
			var cells = tr.find('td, th');
			
			if (tr.is('.thead')) {
				division = tr.text();
				return;
			}
			
			var dataRow = {
				league: $('#info h1 span').eq(1).text(),
				division: division,
				team: cells.eq(0).text().replace(/[\*\+]$/, ''),
				W: cells.eq(1).text(),
				L: cells.eq(2).text(),
			};
			
			if (tr.closest('table').find('thead th:nth-of-type(4)').text().trim() == 'T') {
				dataRow.T = cells.eq(3).text();
			} else {
				dataRow.T = 0;
			}
			
			var playoffList = {
				'WildCard':  'Wild Card',
				'Division':  'Division',
				'ConfChamp': 'Conference',
				'Champ':     'League',
				'SuperBowl': 'SuperBowl',
			};
			
			var playoffCell = $('#playoff_results td').filter((i,e) => e.innerText.trim() == dataRow.team).last();
			if (playoffCell[0]) {
				if (playoffCell[0].cellIndex <= 3)
					dataRow.playoffs = 'Champions';
				else
					dataRow.playoffs = playoffCell.closest('tr').find('th, td').first().text();
					if (playoffList[dataRow.playoffs]) dataRow.playoffs = playoffList[dataRow.playoffs];
			} else {
				if (cells.eq(0).text().match(/\*/))
					dataRow.playoffs = 'Champions';
			}
			
			data.push(dataRow);
			
		});
		
		return data;
		
	}

	// ================================================================
	
	function baseball() {
		
		var data = [];
		
		$('#expanded_standings_overall tbody tr').each((i,e) => {
			
			var tr = $(e);
			var cells = tr.find('td, th');
			
			if (cells.eq(2).text() == '') return;
			
			var dataRow = {
				league: cells.eq(2).text(),
				team: cells.eq(1).find('a').attr('title'),
				W: cells.eq(4).text(),
				L: cells.eq(5).text(),
			};
			
			dataRow.division = $('[id="all_standings"]').find('a')
				.filter((i,e) => e.innerText.trim() == dataRow.team)
				.closest('.table_wrapper').find('h2')
				.text().trim().replace(/ Division/, '');
			
			var playoffList = {
				'Wild Card Game':     'Wild Card',
				'AL Division Series': 'Division',
				'NL Division Series': 'Division',
				'ALCS':               'League',
				'NLCS':               'League',
				'World Series':       'World Series',
			};
			
			var playoffLink = $('#postseason a')
				.filter((i,e) => e.innerText.trim() == dataRow.team).first();
			if (playoffLink.length > 0) {
				var playoffRow = playoffLink.closest('tr');
				if (playoffRow[0].rowIndex == 0 && playoffLink.parent().is('strong')) {
					dataRow.playoffs = 'Champions';
				} else {
					dataRow.playoffs = playoffList[playoffRow.find('td').first().text()];
				}
			}
			
			data.push(dataRow);
			
		});
		
		return data;
		
	}
	
	// ================================================================
	
	function basketball() {
		
		var data = [];
		var division = '';
		
		$('[id^="divs_standings_"] tbody tr').each((i,e) => {
			
			var tr = $(e);
			var cells = tr.find('td, th');
			
			if (tr.is('.thead')) {
				division = tr.text().replace(/ Division$/, '').trim();
				return;
			}
			
			var dataRow = {
				season: '="' + $('#info h1 span').eq(0).text() + '"',
				league: $('#info h1 span').eq(1).text(),
				division: division,
				team: cells.eq(0).text().trim().replace(/[\*\+]?\s+\(\d+\)$/, ''),
				W: cells.eq(1).text(),
				L: cells.eq(2).text(),
			};
			
			if (tr.closest('table').find('thead th:nth-of-type(4)').text().trim() == 'T') {
				dataRow.T = cells.eq(3).text();
			} else {
				dataRow.T = 0;
			}
			
			var playoffs = [];
			var playoffLinks = 
			$('#all_playoffs a').each((i,e) => {
				if (e.innerText.trim() != dataRow.team) return;
				var round = $(e).closest('tr').find('strong').text();
				if (round == 'Finals') {
					if ($(e).nextAll('a').length == 0) playoffs.push('W');
					playoffs.push('F');
				} else if (round.match(/Conference Finals/)) {
					playoffs.push('CF');
				} else if (round.match(/Conference Semifinals/)) {
					playoffs.push('SF');
				} else if (round.match(/First Round/)) {
					playoffs.push('R1');
				} else {
					playoffs.push('?');
				}
			});
			playoffs.reverse();
			dataRow.playoffs = playoffs.join(' › ');
			
			data.push(dataRow);
			
		});
		
		return data;
		
	}
	
	// ================================================================
	
	function hockey() {
		
	}
	
});
