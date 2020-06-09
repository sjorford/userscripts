// ==UserScript==
// @name         Sports Reference extracts
// @namespace    sjorford@gmail.com
// @version      2020.05.10.8
// @author       Stuart Orford
// @match        https://www.pro-football-reference.com/years/*/
// @match        https://www.baseball-reference.com/leagues/MLB/*-standings.shtml
// @match        https://www.basketball-reference.com/leagues/*.html
// @match        https://www.hockey-reference.com/leagues/*.html
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
		'www.hockey-reference.com':       hockey,
	};
	
	var fn = sports[window.location.hostname];
	
	var data = fn.call();
	
	$.each(data, (i,e) => {
		
		var row = $('<tr></tr>').appendTo(table)
			.addCell(e.season || year)
			.addCell(e.league)
			.addCell(e.division)
			.addCell(e.team)
			.addCell(e.W)
			.addCell(e.L)
			.addCell(e.T);
		if (fn = hockey) row.addCell(e.OL);
		row.addCell(e.playoffs);
		
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
				if (dataRow.T == 0) dataRow.T = '';
			}
			
			var playoffList = {
				'WildCard':  'WC',
				'Division':  'Div',
				'ConfChamp': 'Conf',
				'Champ':     'Ch',
				'SuperBowl': 'SB',
			};
			
			var playoffs = [];
			if ($('#playoff_results').length == 0)
				if (cells.eq(0).text().match(/\*/)) playoffs.push('W');
			$('#playoff_results td').filter((i,e) => e.innerText.trim() == dataRow.team).each((i,e) => {
				var round = $(e).closest('tr').find('th').first().text().trim();
				playoffs.push(playoffList[round]);
				if (e.cellIndex <= 3 && $(e).closest('tr').next('tr').length == 0) playoffs.push('W');
			});
			dataRow.playoffs = playoffs.join(' › ');
			
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
				'Wild Card Game':     'WC',
				'AL Division Series': 'Div',
				'NL Division Series': 'Div',
				'ALCS':               'Ch',
				'NLCS':               'Ch',
				'World Series':       'WS',
			};
			
			var playoffs = [];
			$('#postseason a').each((i,e) => {
				var link = $(e);
				if (link.text().trim() != dataRow.team) return;
				var round = link.closest('tr').find('td').first().text().trim();
				if (link.parent().is('strong') && link.closest('tr')[0].rowIndex == 0) playoffs.push('W');
				playoffs.push(playoffList[round]);
			});
			playoffs.reverse();
			dataRow.playoffs = playoffs.join(' › ');
			
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
				team: cells.eq(0).text().trim().replace(/[\*\+]?(\s+\(\d+\))?$/, ''),
				W: cells.eq(1).text(),
				L: cells.eq(2).text(),
			};
			
			if (tr.closest('table').find('thead th:nth-of-type(4)').text().trim() == 'T') {
				dataRow.T = cells.eq(3).text();
				if (dataRow.T == 0) dataRow.T = '';
			}
			
			var playoffs = [];
			$('#all_playoffs a').each((i,e) => {
				if (e.innerText.trim() != dataRow.team) return;
				var round = $(e).closest('tr').find('strong').text();
				if (round == 'Finals') {
					if ($(e).prevAll('a').length == 0) playoffs.push('W');
					playoffs.push('F');
				} else if (round.match(/Conference Finals/)) {
					playoffs.push('CF');
				} else if (round.match(/Division Finals/)) {
					playoffs.push('DF');
				} else if (round.match(/Conference Semifinals/)) {
					playoffs.push('CSF');
				} else if (round.match(/Division Semifinals/)) {
					playoffs.push('DSF');
				} else if (round.match(/Semifinals/)) {
					playoffs.push('SF');
				} else if (round.match(/Quarterfinals/)) {
					playoffs.push('QF');
				} else if (round.match(/First Round/)) {
					playoffs.push('R1');
				} else if (round.match(/Round Robin/)) {
					playoffs.push('RR');
				} else if (round.match(/Tiebreaker/)) {
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
		
		var data = [];
		var division = '';
		
		$('.content_grid').first().find('.thead, .full_table').each((i,e) => {
			
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
				team: cells.eq(0).text().trim().replace(/[\*\+]?(\s+\(\d+\))?$/, ''),
				W: cells.eq(2).text(),
				L: cells.eq(3).text(),
			};
			
			var colOL = tr.closest('table').find('thead th').filter((i,e) => e.innerText.trim() == 'OL').prop('cellIndex');
			if (colOL) dataRow.OL = cells.eq(colOL).text();
			
			var colT = tr.closest('table').find('thead th').filter((i,e) => e.innerText.trim() == 'T').prop('cellIndex');
			if (colT) dataRow.T = cells.eq(colT).text();
			
			var playoffList = {
				'Preliminary Round':         'PR',
				'Quarter-Finals':            'QF',
				'Semi-Finals':               'SF',
				'First Round':               'R1',
				'Second Round':              'R2',
				'Division Semi-Finals':      'DSF',
				'Division Finals':           'DF',
				'Conference Quarter-Finals': 'CQF',
				'Conference Semi-Finals':    'CSF',
				'Conference Finals':         'CF',
				'Final':                     'F',
			};
			
			var playoffs = [];
			$('#all_playoffs a').each((i,e) => {
				if (e.innerText.trim() != dataRow.team) return;
				var round = $(e).closest('tr').find('td').first().text();
				if (round == 'Final') {
					if ($(e).prevAll('a').length == 0) playoffs.push('W');
					playoffs.push('F');
				} else {
					playoffs.push(playoffList[round] || '?');
				}
			});
			playoffs.reverse();
			dataRow.playoffs = playoffs.join(' › ');
			
			data.push(dataRow);
			
		});
		
		return data;
		
	}
	
});
