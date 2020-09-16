// ==UserScript==
// @name         Bob extracts
// @namespace    sjorford@gmail.com
// @version      2020.09.16.1
// @author       Stuart Orford
// @match        http*://search.espncricinfo.com/ci/content/player/search.html?search=bob
// @match        http*://stats.espnscrum.com/statsguru/rugby/stats/analysis.html?search=bob
// @match        https://www.rugbyleagueproject.org/search/?q=bob
// @match        https://afltables.com/afl/stats/stats_idx.html
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
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
	
	var scrapers = registerScrapers();
	
	// Start queue
	start();
	
	function start() {
		console.log('Bob extracts', 'start', window.location.hostname);
		queue = scrapers[window.location.hostname].urls();
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
		GM_xmlhttpRequest({
			method: 'GET',
			url: url,
			onload: scrapePage,
		});
	}
	
	function scrapePage(response) {
		var doc = $(response.responseText);
		var url = response.finalUrl;
		
		var data = scrapers[window.location.hostname].page(doc, url);
		
		if (data.type == 'urls') {
			
			// Add new URLs to queue
			queue = queue.concat(data.urls.filter(url => queue.indexOf(url) < 0));
			
		} else {
			
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
		var trimmedString = dateString.trim();
		
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
	
	// ================================================================
	// ESPNcricinfo
	// ================================================================
	
	// https://www.espncricinfo.com/search/_/type/players/q/bob
	// new search results page, only lists 50 Bobs
	function cricketURLs__BAD() {
		var links = $('.player__Results__Item a')
			.filter((i,e) => $('.LogoTile__Title', e).text().trim().match(/Bob /));
		return links.toArray().map(a => a.href);
	}
	
	function cricketURLs() {
		var links = $('a.ColumnistSmry')
			.filter((i,e) => e.innerText.trim().match(/\(Bob /));
		return links.toArray().map(a => a.href);
	}
	
	function cricketPage(doc) {
		console.log('Bob extracts', 'cricketPage');
		var data = {};
		
		data.sport = 'Cricket';
		data.name = doc.find('.ciPlayernametxt h1').text().trim();
		data.nationality = doc.find('.ciPlayernametxt h3').text().trim();
		
		$('.ciPlayerinformationtxt', doc).each((i,e) => {
			var fieldName = $('b', e).text().trim();
			var fieldValue = $('span', e).text().trim();
			var matchDate = fieldValue.match(/.*?\d{4}/);
			if (fieldName == 'Full name') {
				data.fullName = fieldValue;
			} else if (fieldName == 'Born') {
				if (matchDate) data.dateOfBirth = cleanDate(matchDate[0]);
			} else if (fieldName == 'Died') {
				if (matchDate) data.dateOfDeath = cleanDate(matchDate[0]);
			}
		});
		
		$('.ciPlayertextbottomborder:contains("Career statistics")', doc)
			.nextUntil('.ciPlayertextbottomborder', '.engineTable')
			.first().find('tr').each((i,e) => {
				var fieldName = $('td:first-of-type', e).text().trim();
				var fieldValue = $('td:last-of-type', e).text().trim();
				if (fieldName.match(/debut$/)) {
					var yearFrom = getYearFrom(fieldValue);
					if (!data.yearFrom || yearFrom < data.yearFrom) data.yearFrom = yearFrom;
				} else if (fieldName.match(/^Last/)) {
					var yearTo = getYearTo(fieldValue);
					if (!data.yearTo || yearTo > data.yearTo) data.yearTo = yearTo;
				} else if (fieldName.match(/span$/)) {
					var seasons = fieldValue.match(/^(\S+).*?(\S+)$/);
					var yearFrom = getYearFrom(seasons[1]);
					var yearTo   = getYearTo  (seasons[2]);
					if (!data.yearFrom || yearFrom < data.yearFrom) data.yearFrom = yearFrom;
					if (!data.yearTo   || yearTo   > data.yearTo)   data.yearTo   = yearTo;
				}
			});
		
		return data;
	}
	
	// ================================================================
	// ESPNscrum
	// ================================================================
	
	function rugbyUnionURLs() {
		var links = $('#gurusearch_player tr')
			.filter((i,e) => e.innerText.trim().match(/\(Bob /)).find('a');
		return links.toArray().map(a => a.href.replace(/\?.*/, ''));
	}
	
	function rugbyUnionPage(doc) {
		console.log('Bob extracts', 'scrumPage');
		var data = {};
		
		data.sport = 'Rugby union';
		data.name = doc.find('.scrumPlayerName').text().trim();
		data.nationality = doc.find('.scrumPlayerCountry').text().trim();
		
		$('.scrumPlayerDesc', doc).each((i,e) => {
			var fieldName = $('b', e).detach().text().trim();
			var fieldValue = $(e).text().trim();
			var matchDate = fieldValue.match(/.*?\d{4}/);
			if (fieldName == 'Full name') {
				data.fullName = fieldValue;
			} else if (fieldName == 'Born') {
				if (matchDate) data.dateOfBirth = cleanDate(matchDate[0]);
			} else if (fieldName == 'Died') {
				if (matchDate) data.dateOfDeath = cleanDate(matchDate[0]);
			}
		});
		
		$('.engineTable', doc).filter(':contains("Test career"), :contains("English Premiership")')
			.find('tbody tr').each((i,e) => {
				var match = $('td', e).eq(1).text().trim().match(/^(\d{4})\D+(\d{4})$/);
				var yearFrom = match[1] - 0;
				var yearTo   = match[2] - 0;
				if (!data.yearFrom || yearFrom < data.yearFrom) data.yearFrom = yearFrom;
				if (!data.yearTo   || yearTo   > data.yearTo)   data.yearTo   = yearTo;
			});
		
		return data;
	}
	
	// ================================================================
	// Rugby League Project
	// ================================================================
	
	function rugbyLeagueURLs() {
		var links = $('.list tr:has(h3)').first().nextUntil('tr:has(h3)')
			.filter((i,e) => e.innerText.trim().match(/Bob /)).find('a');
		return links.toArray().map(a => a.href.replace(/\?.*/, ''));
	}
	
	function rugbyLeaguePage(doc) {
		console.log('Bob extracts', 'rugbyLeaguePage');
		var data = {};
		
		data.sport = 'Rugby league';
		data.name = doc.filter('h1').text().trim();
		
		// Get nationality from international matches
		// Exclude "NSW Firsts" etc.
		data.nationality = [...new Set(
			$('.list tr:contains("International")', doc)
				.nextUntil('tr:contains("Club Career")')
				.find('.text a')
				.filter((i,e) => !e.innerText.trim().match(/^[A-Z]{3}/))
				.toArray().map(a => a.innerText.trim()))].join(', ');
		
		$('.stats dt', doc).each((i,e) => {
			var fieldName = $(e).text().trim();
			var fieldValue = $(e).next('dd').text().trim();
			var matchDate = fieldValue.match(/.*?\d{4}/);
			if (fieldName == 'Full Name') {
				data.fullName = fieldValue;
			} else if (fieldName == 'Born') {
				if (matchDate) data.dateOfBirth = cleanDate(matchDate[0]);
			} else if (fieldName == 'Died') {
				if (matchDate) data.dateOfDeath = cleanDate(matchDate[0]);
			}
		});

		$('.total td:nth-of-type(2)', doc).each((i,e) => {
			var match = $(e).text().trim().match(/^(\d{4})(?:\D+(\d{4}))?$/);
			var yearFrom = match[1] - 0;
			var yearTo   = match[2] ? match[2] - 0 : yearFrom;
			if (!data.yearFrom || yearFrom < data.yearFrom) data.yearFrom = yearFrom;
			if (!data.yearTo   || yearTo   > data.yearTo)   data.yearTo   = yearTo;
		});
		
		return data;
	}
	
	// ================================================================
	// AFL Tables
	// ================================================================
	
	function aussieRulesURLs() {
		var links = $('a').filter((i,e) => e.href.match(/\d{4}s?\.html$/));
		return links.toArray().map(a => a.href.replace(/s\.html$/, '.html'));
	}
	
	function aussieRulesPage(doc, url) {
		console.log('Bob extracts', 'aussieRulesPage');
		var data = {};
		
		// Scrape player URLs from year summary pages
		if (!url.match(/players/)) {
			data.type = 'urls';
			data.urls = $('a[href^="players"]', doc).filter((i,e) => e.textContent.match(/, Bob(\s|$)/))
				.toArray().map(a => a.href);
			return data;
		}
		
		data.sport = 'Aussie rules';
		data.name = $('h1', doc).text().trim();
		
		try {
			data.dateOfBirth = $('b', doc).filter((i,e) => e.textContent.trim() == 'Born:')[0].nextSibling.textContent.replace(/[-\(]/g, ' ').trim();
		} catch (error) {
		}
		
		try {
			data.dateOfDeath = $('b', doc).filter((i,e) => e.textContent.trim() == 'Died:')[0].nextSibling.textContent.replace(/[-\(]/g, ' ').trim();
		} catch (error) {
		}
		
		var links = $('a', doc);
		var yearLinks = links.filter((i,e) => e.textContent.trim().match(/^\d{4}$/));
		data.yearFrom = yearLinks.first().text();
		data.yearTo   = yearLinks.last() .text();
		
		return data;
	}
	
	// ================================================================
	
	function registerScrapers() {
		return {
			'search.espncricinfo.com':    {urls: cricketURLs,     page: cricketPage},
			'stats.espnscrum.com':        {urls: rugbyUnionURLs,  page: rugbyUnionPage},
			'www.rugbyleagueproject.org': {urls: rugbyLeagueURLs, page: rugbyLeaguePage},
			'afltables.com':              {urls: aussieRulesURLs, page: aussieRulesPage},
		};
	}
	
})($.noConflict());
