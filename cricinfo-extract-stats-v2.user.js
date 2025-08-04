// ==UserScript==
// @name           Cricinfo extract stats v2
// @version        2025.08.04.0
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @include        https://stats.espncricinfo.com/ci/engine/stats/index.html?*
// @include        https://stats.espncricinfo.com/ci/content/records/*
// @include        https://stats.espncricinfo.com/*/engine/records/*
// @include        https://stats.espncricinfo.com/*/engine/player/*
// @run-at         document-end
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// @grant          none
// ==/UserScript==

(function($) {
	
	var debug = true;
	
	$(`<style>
		.sjo-table td {font-size: 9pt !important; margin: 0px; padding: 2px 5px;}
		.sjo-wrapper {display: inline-block; border: 1px solid blue; background-color: white; font-size: 8pt; overflow: scroll; max-height: 200px;}
	</style>`).appendTo('head');
	
	// Create output table
	var outputTable = $('<table class="sjo-table"></table>')
			.appendTo('#ciHomeContent')
			.wrap('<div class="sjo-wrapper"></div>')
			.click(function() {
				outputTable.selectRange();
			});
	var outputHeaders = [];
	
	// Get stats table
	function getMainTable(doc) {
		return $('tr.data1, tr.data2', doc).has('td+td').not(':has(.Paginationdisable, .PaginationLink)').closest('.engineTable').last();
	}
	var origTable = getMainTable(document);
	if (origTable.length == 0) return;
	var origHeaderCells = origTable.find('.headlinks th, .head th');
	var origHeaderText = origHeaderCells.toArray().map(e => e.innerText.trim());
	
	// Check if runs column should be parsed as total runs instead of a single score
	var runsAreTotal = (
		origHeaderText.indexOf('HS') >= 0 || 
		origHeaderText.indexOf('High') >= 0 || 
		origHeaderText.indexOf('Wkts') >= 0);
	
	var teamStats = ($('guruNav active').text() == 'Team'); // TODO: what is this?
	if (debug) console.log('teamStats', teamStats, 'runsAreTotal', runsAreTotal);
	
	var parsers = loadCellParsers();
	
	// ====================================================================================================
	
	// Parse table structure
	var colFunctions = [];
	var firstRow = origTable.find('.data1, .data2').first();
	var firstRowCells = firstRow.find('td');
	
	// Add headers for title row
	var titleRow = firstRow.prev('.title');
	if (titleRow.length > 0) {
		var a = titleRow.find('.data-link');
		if (a.length > 0) {
			if (a.attr('href').indexOf('/series/') >= 0) {
				outputHeaders.push('ID', 'Host', 'Teams', 'Series', 'Season');
			} else {
				outputHeaders.push('ID', 'Note');
			}
		} else {
			outputHeaders.push('Note');
		}
	}
	
	// Add headers for note row
	var noteRow = firstRow.next('.note');
	if (noteRow.length > 0) {
		var a = noteRow.find('.data-link');
		if (a.length > 0) {
			if (a.attr('href').indexOf('/series/') >= 0) {
				outputHeaders.push('ID', 'Host', 'Teams', 'Series', 'Season');
			} else {
				outputHeaders.push('ID', 'Note');
			}
		} else {
			outputHeaders.push('Note');
		}
	}
	
	$.each(origHeaderText, (colIndex, colName) => {
		
		var td = firstRowCells.eq(colIndex);
		var data = getCellData(td);
		
		// Skip first header if there is a title row (e.g. for series)
		if (colIndex == 0 && titleRow.length > 0) {
			colFunctions.push(null);
			return;
		}
		
		// Skip blank columns
		if (colName === '' && data.text === '') {
			colFunctions.push(null);
			return;
		}
		
		switch (colName) {
			
			// Players and match officials
			case 'Player':
			case 'Official':
				
				var hasCountry = data.text.indexOf('(') >= 0;
				
				if (data.id && hasCountry) {
					outputHeaders.push('ID');
					outputHeaders.push('Name');
					outputHeaders.push('Team');
					colFunctions.push(parsers.nameIDCountry);
				} else if (data.id) {
					outputHeaders.push('ID');
					outputHeaders.push('Name');
					colFunctions.push(parsers.nameID);
				} else if (hasCountry) {
					outputHeaders.push('Name');
					outputHeaders.push('Team'); // FIXME: for umpires, should be country?
					colFunctions.push(parsers.nameCountry);
				} else {
					outputHeaders.push('Name');
					colFunctions.push(parsers.default);
				}
				
				break;
				
			// Runs
			case 'Runs':
				if (runsAreTotal) {
					outputHeaders.push(colName);
					colFunctions.push(parsers.default);
					break;
				}
				
			case 'HS':
			case 'LS':
				// FIXME?
				if (teamStats) {
					outputHeaders.push(colName);
					colFunctions.push(parsers.default);
					break;
				}
				
			case 'High':
			case 'Bat1':
			case 'Bat2':
				outputHeaders.push(colName, 'NO');
				colFunctions.push(parsers.runs);
				break;
				
			// Span of years
			case 'Span':
				if (data.text.match(/[yd]/)) {
					outputHeaders.push('Years', 'Days');
				} else {
					outputHeaders.push('From', 'To');
				}
				colFunctions.push(parsers.span);
				break;
				
			case 'Opposition':
				outputHeaders.push('ID', 'Opposition');
				colFunctions.push(parsers.teamID);
				break;
				
			case 'Ground':
				outputHeaders.push('ID', 'Ground');
				colFunctions.push(parsers.groundID);
				break;
				
				
				
				
				
				
				
				
				
				
				
				
			default:
				
				if (colName.match(/^\d+$/)) {
					outputHeaders.push(colName + 's');
				} else {
					outputHeaders.push(colName);
				}
				colFunctions.push(parsers.default);
				
		}
		
	});
	
	// Add header for match ID
	var hasMatchIDs = false;
	var matchLink = $('#engine-dd1').find('a[href*="/match/"]');
	if (matchLink.length > 0) {
		hasMatchIDs = true;
		outputHeaders.push('ID');
	}
	
	if (debug) console.log('outputHeaders', outputHeaders);
	if (debug) console.log('colFunctions', colFunctions);
	
	var outputHeaderRow = $('<tr class="sjo-header"></td>').appendTo(outputTable);
	$.each(outputHeaders, (i,header) => {
		$('<th></th>').text(header).appendTo(outputHeaderRow);
	});
	
	// ====================================================================================================
	
	// Parsing functions
	function loadCellParsers() {
		
		var parsers = {};
		
		parsers.default = (data) => {
			return data.text;
		};

		// Player (or official) name, ID, and team/country
		// Match officials do not currently link to profiles
		parsers.nameIDCountry = (data) => {
			var match = data.text.match(/^(.+?)(?: \((.+)\))?$/);
			var name = match[1];
			var country = match[2];
			return [data.id, name, country];
		};

		parsers.nameID = (data) => {
			return [data.id, data.text];
		};

		parsers.nameCountry = (data) => {
			var match = data.text.match(/^(.+?)(?: \((.+)\))?$/);
			var name = match[1];
			var country = match[2];
			return [name, country];
		};

		// Player/partnership runs, including "*" for not out
		// May be "DNB", "TDNB", "-", etc
		parsers.runs = (data) => {
			var match = data.text.match(/^(\d+)(\*)?$/);
			if (match) {
				return match.slice(1);
			} else {
				return [data.text, ''];
			}

		};

		// Team (or opposition) and ID
		parsers.teamID = (data) => {
			var team = data.text.replace(/^v /, '');
			return [data.id, team]
		};

		// Ground and ID
		parsers.groundID = (data) => {
			return [data.id, data.text]
		};

		// Span of years
		// May be "2000-2005" or "5y 100d"
		parsers.span = (data) => {
			return data.text.replace(/[yd]/g, '').replace('-', ' ').split(' ');
		};

		// Bowling stats (wkts/runs)
		parsers.bowling = (data) => {
			if (data.text == '-') {
				return ['-', '-'];
			} else {
				return data.text.split('/');
			}
		};

		// Match score, including "d" for declaration
		// May be "DNB", "TDNB", "-", etc
		parsers.score = (data) => {
			return data.text.match(/^(\d+|T?DNB)(?:\/(\d+))?(d)?$/).slice(1);
		};

		// TODO: Balls faced may be incomplete, indicated by "+"
		
		return parsers;
		
	}
	
	// ====================================================================================================
	
	// Process this page
	if (hasMatchIDs) getMatchIDs(document);
	processTable(origTable);
	
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
				//processTable(origTable);
				return;
			}
			
			var pageURL = baseURL.replace(/\bpage=\d+/, 'page=' + nextPage);
			
			status.text('Downloading page ' + nextPage);
			$.get(pageURL, data => {
				var doc = $(data);
				if (hasMatchIDs) getMatchIDs(doc);
				var newTable = getMainTable(doc);
				processTable(newTable);
				var newHTML = newTable.find('tbody').html();
				origTable.find('tbody').append(newHTML);
				nextPage++;
				getNextPage();
			});
			
		}
		
	}
	
	// Find match number from popup menu
	function getMatchIDs(doc) {
		$('.data1', doc).each((i,e) => {
			var tr = $(e);
			var a = $('#engine-dd' + (i + 1), doc).find('a[href*="/match/"]');
			var id = getLinkID(a);
			tr.attr('data-sjo-matchid', id);
		});
	}
	
	// ====================================================================================================
	
	// Helper functions
	function getLinkID(a) {
		
		if (a.length == 0) return null;
		
		var href = a.attr('href');
		var match = href.match(/(\d+)\.html$/);
		if (match) {
			return match[1];
		} else {
			return null;
		}
		
	}
	
	function getCellData(td) {
		
		var text = td.text().trim();
		var a = td.find('a').first();
		var id = getLinkID(a);
		
		var data = {
			td: td, 
			text: text, 
			a: a, 
			id: id,
		};
		
		return data;
		
	}
	
	function parseSeriesHeader(text) {
		
		var text = text.replace('[', '(').replace(']', ')');
		var match = text.match(/(.+), (.+)$/);
		var series = match[1].replace(', ', '/');
		var season = match[2].replace('-', ' to ').replace('/', '&ndash;');
		
		var hosts = [], teams = [], trophy = '';
		
		match = null;
		if (!match) {
			match = series.match(/^(.+?) in (.+?) Test (?:Match|Series)$/);
			if (match) {
				teams = match[1].split('/')
				hosts = match[2].split('/')
				if (teams.length == 1) teams = teams.concat(hosts);
			}
		}
		
		if (!match) {
			match = series.match(/^(.+) \((.+?) in (.+?)\)$/);
			if (match) {
				trophy = match[1];
				teams = match[2].split('/')
				hosts = match[3].split('/');
				if (teams.length == 1) teams = teams.concat(hosts);
			}
		}
		
		if (!match) {
			match = series.match(/^(.+?) v (.+?) Test (?:Match|Series) \(in (.+?)\)$/);
			if (match) {
				teams = [match[1], match[2]];
				hosts = match[3].split('/');
			}
		}
		
		if (!match) {
			trophy = series;
		}
		
		hosts = hosts.sort();
		teams = teams.sort();
		
		return [hosts.join(', '), teams.join(', '), trophy, season];
		
	}
	
	// ==============================================================
	
	
	function processTable(mainTable) {
		if (debug) console.log('processTable', mainTable);
		
		// Process data rows
		mainTable.find('.data1, .data2').each(processRow);
		outputTable.selectRange();

		function processRow(index, element) {
			
			var thisRow = $(this);
			var results = [];
			
			// Get data from title row
			var titleRow = thisRow.prev('.title');
			if (titleRow.length > 0) {
				
				var a = titleRow.find('.data-link');
				var titleID = getLinkID(a);
				var titleText = titleRow.text().trim();
				if (a.attr('href').indexOf('/series/') >= 0) {
					results = results.concat([titleID]).concat(parseSeriesHeader(titleText));
				} else {
					results = results.concat([titleID, titleText]);
				}
				
			}
			
			// Get data from note row
			var noteRow = thisRow.next('.note');
			if (noteRow.length > 0) {
				
				var a = noteRow.find('.data-link');
				var noteID = getLinkID(a);
				var noteText = noteRow.text().trim();
				if (a.attr('href').indexOf('/series/') >= 0) {
					results = results.concat([noteID]).concat(parseSeriesHeader(noteText));
				} else {
					results = results.concat([noteID, noteText]);
				}
				
			}
			
			// Get data from each cell
			thisRow.find('td').each(function(index, element) {
				
				var fn = colFunctions[index];
				if (fn === null) return;
				
				var td = $(element);
				var data = getCellData(td);
				var cellResult = fn.call(null, data);
				if (cellResult !== null) results = results.concat(cellResult);
				
			});
			
			// Find match number from popup menu
			var matchID = thisRow.data('sjo-matchid');
			if (matchID) results.push(matchID);
			
			// Add data to output row
			// Use .html() so HTML entities are parsed
			var outputRow = $('<tr></tr>').appendTo(outputTable);
			$.each(results, function(index, value) {
				$('<td></td>').html(value).appendTo(outputRow);
			});
			
		}
		
		// Deprecated
		function parseCell(index, element) {
			
			var td = $(element);
			var a = td.find('a');
			var href = a.first().attr('href');
			var text = td.text();
			
			switch (tableHeaders[index]) {
				
					
					
					
					
					
					
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
