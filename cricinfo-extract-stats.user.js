// ==UserScript==
// @id             cricinfo-extract-stats@espncricinfo.com@sjorford@gmail.com
// @name           Cricinfo extract stats
// @version        2017-09-21
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @include        http://stats.espncricinfo.com/ci/engine/stats/index.html?*
// @include        http://stats.espncricinfo.com/ci/content/records/*
// @include        http://stats.espncricinfo.com/*/engine/records/*
// @include        http://stats.espncricinfo.com/*/engine/player/*
// @include        http://stats.espnscrum.com/*
// @run-at         document-end
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @grant          none
// ==/UserScript==

var debug = false;

$(function() {
	
	var teamsMap = {
		'AFR':		'',
		'ASIA':		'',
		'AUS':		'Aus',
		'BDESH':	'Ban',
		'BMUDA':	'Ber',
		'ENG':		'Eng',
		'HKG':		'HK',
		'ICC': 		'',
		'INDIA': 	'Ind',
		'KENYA':	'Ken',
		'NL':		'Neth',
		'PAK':		'Pak',
		'PNG':		'PNG',
		'NZ':		'NZ',
		'SA':		'SA',
		'SL':		'SL',
		'UAE':		'UAE',
		'WI':		'WI',
		'ZIM':		'Zim',
	};
	
	// Process all tables
	$('.engineTable').each(function (index, element) {
		processTable($(element));
	});

	// Select the data for copying
	selectRange('.sjotable');

	function processTable(mainTable) {
		if (debug) console.log('processTable', mainTable);
		
		var exportTable;
	
		// Get table headers
		var tableHeaders = [];
		mainTable.find('.headlinks th, .head th').each(function() {
			var colName = $(this).text().toLowerCase();
			tableHeaders.push(colName);
		});
		if (tableHeaders.length === 0) return;
		if (debug) console.log('tableHeaders', tableHeaders);
	
		// Check if runs column should be parsed as total runs instead of a single score
		var runsAreTotal = (
			tableHeaders.indexOf('hs') >= 0 || 
			tableHeaders.indexOf('high') >= 0 || 
			tableHeaders.indexOf('wkts') >= 0);
		
		var teamStats = ($('guruNav active').text() == 'Team');
		if (debug) console.log('teamStats', teamStats, 'runsAreTotal', runsAreTotal);
	
		// Create a box to hold the export results
		createExportBox();
		
		// Process data rows
		mainTable.find('.data1, .data2').each(processRow);
		
		function createExportBox() {
			
			// Add export table
			exportTable = $('<table class="sjotable"></table>')
				.appendTo('#ciHomeContent, #scrumContent')
				.wrap('<div class="sjobox" style="display: inline-block; border: 1px solid blue; background-color: white; font-size: 8pt; overflow: scroll; max-height: 200px;"></div>')
				.click(function() {
					selectRange(this);
				});
			$('<style>.sjotable td {font-size: 9pt !important; margin: 0px; padding: 2px 5px;}</style>').appendTo('head');
				
		}
		
		function processRow(index, element) {
			if (debug) console.log('processRow', index, element);
			
			var results = [];
		
			var thisRow = $(this);
			
			// Get data from each cell
			thisRow.find('td').each(function(index, element) {
				results = results.concat(parseCell(index, element));
			});
			
			// Get data from note row
			var noteRow = thisRow.next('.note');
			if (noteRow.length > 0) {
		
				var noteText = noteRow.children().first().text();
				if (noteText.indexOf('(') === 0) {
					noteText = noteText.substr(1, noteText.length - 2);
				}
				results = results.concat(noteText);
				
				var noteLink = noteRow.find('.data-link');
				if (noteLink.length > 0) {
					var linkParts = noteLink.attr('href').split('/');
					var linkID = linkParts[linkParts.length - 1].replace('.html', '');
					results = results.concat(linkID);
				}
				
			}
			
			// Find match number from popup menu
			var match = $('#engine-dd' + (index + 1)).find('a[href*="/match/"]');
			if (match.length > 0) {
				results.push(match.attr('href').split('/match/')[1].split('.html')[0]);
			}
			
			// Add data to export row
				var exportRow = $('<tr></tr>').appendTo(exportTable);
			$.each(results, function(index, value) {
				$('<td></td>').html(value).appendTo(exportRow);
			});
			
		}
			
		function parseTeams(teams) {
			var newArray = [];
			teams.split('/').forEach(function(element) {
				var teamKey = element.toUpperCase();
				if (teamsMap.hasOwnProperty(teamKey)) {
					if (teamsMap[teamKey] !== '') {
						newArray.push(teamsMap[teamKey]);
					}
				} else {
					newArray.push(element.toProperCase());
				}
			});
			return newArray.join('/');
		}
		
		function parseCell(index, element) {
			
			var td = $(element);
			var a = td.find('a');
			var href = a.first().attr('href');
			var text = td.text();
			
			switch (tableHeaders[index]) {
				
				// Split out player ID and team, and remove combined teams
				case 'player':
					if (a.length > 0) {
						if (text.indexOf(' (') >= 0) {
							return [
								href.split('/player/')[1].split('.html')[0],
								text.split(' (')[0],
								parseTeams(text.split(' (')[1].replace(/[)]$/, ''))
							];
						} else {
							return [
								href.split('/player/')[1].split('.html')[0],
								text
							];
						}
					} else {
						return [
							text.split(' (')[0],
							parseTeams(text.split(' (')[1].replace(/[)]$/, ''))
						];
					}
					
				// Split out * indicator for not outs
				case 'runs':
					if (runsAreTotal) return text;
				case 'hs':
				case 'ls':
					if (teamStats) return text;
				case 'high':
				case 'bat1':
				case 'bat2':
					return [
						text.replace('*', ''),
						text.indexOf('*') >= 0 ? '*' : ''
					];
					
				// Split out team ID
				case 'team':
				case 'opposition':
					var team = text.replace(/^v /, '').split(' v ');
					if (href) {
						team.splice(-1, 0, href.split('/team/')[1].split('.html')[0]);
					}
					return team;
					
				// Split out venue ID
				case 'ground':
					if (href) {
						return [
							href.split('/ground/')[1].split('.html')[0],
							text
						];
					} else {
						return text;
					}
					
				// Split span into years/days, or from/to years
				case 'span':
					return text.replace(/[yd]/g, '').replace('-', ' ').split(' ');
					
				// Split bowling figures into wickets/runs
				case 'bbi':
				case 'bbm':
				case 'in':
				case 'out':
				case 'score':
					if (text == '-') {
						return ['-', '-'];
					} else {
						return text.split('/').concat('-').slice(0, 2);
					}
					
				// Split fielding figures into total/catches/stumpings
				case 'md':
					return text.replace(/ \(|ct |st\)/g, ' ').split(' ');
					
				// Split partners
				case 'partners':
					var href2 = a.eq(1).attr('href');
					return [
						href.split('/player/')[1].split('.html')[0],
						text.split(', ')[0],
						href2.split('/player/')[1].split('.html')[0],
						text.split(', ')[1].split(' (')[0],
						parseTeams(text.split(' (')[1].replace(/[)]$/, ''))
					];
					
				case 'scorecard':
					return [
						href.split('/match/')[1].split('.html')[0],
						text
					];
		
				case 'match':
					return text.split(' v ');
					
				case 'margin':
					if (text == '-' || text == '') {
						return ['', '', ''];
					} else if (text.indexOf('inns & ') == -1) {
						return [''].concat(text.split(' '));
					} else {
						return text.replace(' & ', ' ').split(' ');
					}
					
				case '':
					if (text !== '') {
						return text;
					} else {
						return [];
					}
					
				default:
					return text;
				
			}
				
		}
		
	}
	
	function selectRange(element) {
		var range = document.createRange();
		range.selectNodeContents($(element).get(0));
		var selection = window.getSelection();        
		selection.removeAllRanges();
		selection.addRange(range);
	}
	
});

String.prototype.toProperCase = String.prototype.toProperCase || function () {
    return this.replace(/\w\S*/g, function(word) {return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();});
};
