// ==UserScript==
// @name         Bob extracts
// @namespace    sjorford@gmail.com
// @version      2020.09.18.0
// @author       Stuart Orford
// @match        http*://search.espncricinfo.com/ci/content/player/search.html?search=bob
// @match        http*://stats.espnscrum.com/statsguru/rugby/stats/analysis.html?search=bob
// @match        https://www.rugbyleagueproject.org/search/?q=bob
// @match        https://afltables.com/afl/stats/stats_idx.html
// @match        https://australianfootball.com/search/advanced_search
// @match        https://www.pgatour.com/players.html
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// @require      https://raw.githubusercontent.com/sjorford/userscripts/master/bobs/espn-cricinfo.js
// @require      https://raw.githubusercontent.com/sjorford/userscripts/master/bobs/espn-scrum.js
// @require      https://raw.githubusercontent.com/sjorford/userscripts/master/bobs/rugby-league-project.js
// @require      https://raw.githubusercontent.com/sjorford/userscripts/master/bobs/afl-tables.js
// @require      https://raw.githubusercontent.com/sjorford/userscripts/master/bobs/australian-football.js
// @require      https://raw.githubusercontent.com/sjorford/userscripts/master/bobs/pga-tour.js
// ==/UserScript==

(function($) {
	
	$(`<style>
		.sjo-wrapper {width: 100%; clear: both;}
		.sjo-box {border: 1px solid blue; width: auto; background-color: white; overflow: scroll; max-height: 200px; padding: 0.5em;}
		.sjo-table td {margin: 0px; padding: 2px 5px; font-family: Calibri; font-size: 11pt;}
	</style>`).appendTo('head');
	
	// Add export table
	var table = $('<table class="sjo-table"></table>')
		.appendTo('body')
		.wrap('<div class="sjo-wrapper"></div>')
		.wrap('<div class="sjo-box"></div>');
	$('.sjo-wrapper')
		.click(function() {
			$(this).selectRange();
		});
	
	// Register scrapers
	var scrapers = {
		'search.espncricinfo.com':    {urls: espnCricinfoURLs,       page: espnCricinfoPage},
		'stats.espnscrum.com':        {urls: espnScrumURLs,          page: espnScrumPage},
		'www.rugbyleagueproject.org': {urls: rugbyLeagueProjectURLs, page: rugbyLeagueProjectPage},
		'afltables.com':              {urls: aflTablesURLs,          page: aflTablesPage},
		'australianfootball.com':     {urls: australianFootballURLs, page: australianFootballPage},
		'www.pgatour.com':            {urls: pgaTourURLs,            page: pgaTourPage},
	};
	
	// Register helper functions
	$.sjo = {
		getYearFrom: getYearFrom,
		getYearTo:   getYearTo,
		cleanDate:   cleanDate,
	};
	
	// Start queue
	start();
	
	function start() {
		console.log('Bob extracts', 'start', window.location.hostname);
		queue = scrapers[window.location.hostname].urls($);
		console.log('Bob extracts', 'start', queue.length);
		if (queue.length > 0) {
			nextPage();
		} else {
			window.setTimeout(start, 1000);
		}
	}
	
	function nextPage() {
		console.log('Bob extracts', 'nextPage', queue.length);
		if (queue.length == 0) return;
		var url = queue.shift();
		console.log('Bob extracts', 'nextPage', url);
		var request = {
			method: 'GET',
			url: url,
			onload: scrapePage,
		}
		if (url.match(/json/)) request.responseType = 'json';
		GM_xmlhttpRequest(request);
	}
	
	var partialData;
	
	function scrapePage(response) {
		var doc = response.response ? response.response : $(response.responseText);
		var url = response.finalUrl;
		
		var data = scrapers[window.location.hostname].page($, doc, url);
		
		if (data.type == 'urls') {
			
			// Add new URLs to queue
			queue = queue.concat(data.urls.filter(url => queue.indexOf(url) < 0));
			
		} else if (data.type == 'partial') {
			
			// Save partial data
			if (partialData) {
				partialData = {...partialData, ...data}
			} else {
				partialData = data;
			}
			
		} else {
			
			// Merge with previous partial data
			if (partialData) {
				data = {...partialData, ...data};
				partialData = null;
			}

			// Add Bob to table
			var row = $('<tr></tr>').appendTo(table);
			$('<td></td>').text(data.name)       .appendTo(row);
			$('<td></td>').text(data.fullName)   .appendTo(row);
			$('<td></td>').text(data.dateOfBirth).appendTo(row);
			$('<td></td>').text(data.dateOfDeath).appendTo(row);
			$('<td></td>').text(data.nationality).appendTo(row);
			$('<td></td>').text(data.sport)      .appendTo(row);
			$('<td></td>').text(data.yearFrom)   .appendTo(row);
			$('<td></td>').text(data.yearTo)     .appendTo(row);
			$('<td></td>').text(url)             .appendTo(row);
			
		}
		
		nextPage();
	}
	
	// Helper functions
	// ================================================================
	
	function getYearFrom(text) {
		var match = text.match(/(\d{4})/);
		if (match) {
			return match[1] - 0;
		} else {
			return null;
		}
	}
	
	function getYearTo(text) {
		var match1 = text.match(/(\d{2})(\d{2})\D(\d{2})(\d{2})?/);
		var match2 = text.match(/\d{4}/);
		if (match1) {
			if (match1[4]) {
				return (match1[3] + match1[4]) - 0;
			} else if ((match1[3] - match1[2] + 100) % 100 == 1) {
				return ((match1[1] + match1[2]) - 0) + 1;
			} else {
				return '?';
			}
		} else if (match2) {
			return match2[0] - 0;
		} else {
			return null;
		}
	}
	
	function cleanDate(dateString) {
		if (!dateString) return dateString;
		var trimmedString = dateString.trim().replace(/(\d{4}).*$/, '$1');
		
		// January 1, 2000
		var match = trimmedString.match(/^(\w{3,}) (\d{1,2}), (\d{4})$/);
		if (match) return match[2] + ' ' + match[1].substr(0, 3) + ' ' + match[3];
		
		// 1 January 2000
		match = trimmedString.match(/^(\d{1,2}) (\w{3,}) (\d{4})$/);
		if (match) return match[1] + ' ' + match[2].substr(0, 3) + ' ' + match[3];
		
		// Monday, 1st January, 2000
		var match = trimmedString.match(/^\w{3,}, (\d{1,2})\w{2} (\w{3,}), (\d{4})$/);
		if (match) return match[1] + ' ' + match[2].substr(0, 3) + ' ' + match[3];
		
		return trimmedString;
	}
	
})($.noConflict());
