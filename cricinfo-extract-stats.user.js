// ==UserScript==
// @id             cricinfo-extract-stats@espncricinfo.com@sjorford@gmail.com
// @name           Cricinfo extract stats
// @version        2022.11.01.0
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @include        https://stats.espncricinfo.com/ci/engine/stats/index.html?*
// @include        https://stats.espncricinfo.com/ci/content/records/*
// @include        https://stats.espncricinfo.com/*/engine/records/*
// @include        https://stats.espncricinfo.com/*/engine/player/*
// @include        https://stats.espnscrum.com/*
// @run-at         document-end
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// @grant          none
// ==/UserScript==

(function($) {
	
	var debug = false;
	
	$('<style>.sjotable td {font-size: 9pt !important; margin: 0px; padding: 2px 5px;}</style>').appendTo('head');
	
	function getMainTable(doc) {
		return $('tr.data1, tr.data2', doc).has('td+td').not(':has(.Paginationdisable, .PaginationLink)').closest('.engineTable').last();
	}
	
	var mainTable = getMainTable(document);
	if (mainTable.length == 0) return;
	
	findMatchIDs(document);
	processTable(mainTable);
	
	// Add a button to retrieve all pages
	var paginationTable = $('a.PaginationLink').first().closest('.engineTable');
	var numPages = paginationTable.find('td').first().text().trim().match(/^Page (\d+) of (\d+)$/)
	if (numPages && numPages[1] === '1') {
		var allPagesButton = $('<a class="PaginationLink" href="#">Retrieve all pages</a>')
				.insertAfter(paginationTable).click(retrieveAllPages);
	}
	
	function retrieveAllPages(event) {
		event.preventDefault();
		
		var status = $('<span></span>').insertAfter(allPagesButton);
		allPagesButton.hide();
		numPages[1] = numPages[1] - 0;
		numPages[2] = numPages[2] - 0;
		
		var baseURL = $('a.PaginationLink').filter((i,e) => e.innerText.trim() == 'Next').attr('href');
		var nextPage = 2;
		getNextPage();
		
		function getNextPage() {
			if (nextPage > numPages[2]) {
				status.text('Done');
				processTable(mainTable);
				return;
			}
			
			var pageURL = baseURL.replace(/\bpage=\d+/, 'page=' + nextPage);
			
			status.text('Downloading page ' + nextPage);
			$.get(pageURL, data => {
				var doc = $(data);
				findMatchIDs(doc);
				var newHTML = getMainTable(doc).find('tbody').html();
				mainTable.find('tbody').append(newHTML);
				nextPage++;
				getNextPage();
			});
			
		}
		
	}
	
	// Find match number from popup menu
	function findMatchIDs(doc) {
		$('.data1', doc).each((i,e) => {
			var tr = $(e);
			var matchLink = $('#engine-dd' + (i + 1), doc).find('a[href*="/match/"]');
			if (matchLink.length > 0) {
				var matchID = matchLink.attr('href').split('/match/')[1].split('.html')[0];
				tr.attr('data-sjo-matchid', matchID);
			}
		});
	}
	
	// ==============================================================
	
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
		exportTable.selectRange();

		function createExportBox() {
			$('.sjobox').remove();
			
			// Add export table
			exportTable = $('<table class="sjotable"></table>')
				.appendTo('#ciHomeContent, #scrumContent')
				.wrap('<div class="sjobox" style="display: inline-block; border: 1px solid blue; background-color: white; font-size: 8pt; overflow: scroll; max-height: 200px;"></div>')
				.click(function() {
					exportTable.selectRange();
				});
				
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
			var matchID = thisRow.data('sjo-matchid');
			if (matchID) results.push(matchID);
			
			// Add data to export row
				var exportRow = $('<tr></tr>').appendTo(exportTable);
			$.each(results, function(index, value) {
				$('<td></td>').html(value).appendTo(exportRow);
			});
			
		}
			
		function parseTeams(teams) {
			return teams;
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
					if (text == '-') {
						return ['-', '-'];
					} else {
						return text.split('/').concat('-').slice(0, 2);
					}
					
				case 'score':
					var scoreParts = text.match(/^(\d+)(?:\/(\d+))?(d)?$/);
					if (!scoreParts) {
						return [text, '', ''];
					} else {
						return scoreParts.slice(1);
					}
					
				// Split fielding figures into total/catches/stumpings
				case 'md':
					return text.replace(/ \(|ct |st\)/g, ' ').split(' ');
					
				// Split partners
				case 'partners':
					if (href) {
						var href2 = a.eq(1).attr('href');
						return [
							href.split('/player/')[1].split('.html')[0],
							text.split(', ')[0],
							href2.split('/player/')[1].split('.html')[0],
							text.split(', ')[1].replace(/ \(\D*\)/, ''),
							parseTeams(text.match(/ \((\D*)\)/)[1])
						];
					} else {
						return text;
					}
					
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
					
				case 'overs':
					if (text.match(/x/)) {
						return text.split('x');
					} else {
						return [text, ''];
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
	
})(jQuery);

String.prototype.toProperCase = String.prototype.toProperCase || function () {
    return this.replace(/\w\S*/g, function(word) {return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();});
};
