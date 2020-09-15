// ==UserScript==
// @name         Bob extracts
// @namespace    sjorford@gmail.com
// @version      2020.09.15.1
// @author       Stuart Orford
// @match        http://search.espncricinfo.com/ci/content/player/search.html?search=bob&x=0&y=0
// @match        https://search.espncricinfo.com/ci/content/player/search.html?search=bob&x=0&y=0
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
	
	$(`<style>
		.sjo-wrapper {width: 100%;}
		.sjo-box {border: 1px solid blue; width: auto; background-color: white; font-family: Calibri; font-size: 11pt; overflow: scroll; max-height: 200px; padding: 0.5em;}
		.sjo-table td {margin: 0px; padding: 2px 5px; font-size: small;}
	</style>`).appendTo('head');
	
	// Add export table
	var table = $('<table class="sjo-table"></table>');
		.appendTo('body')
		.wrap('<div class="sjo-wrapper"></div>')
		.wrap('<div class="sjo-box"></div>');
	$('.sjo-wrapper')
		.click(function() {
			$(this).selectRange();
		});
	
	// Set up list of functions
	var scrapers = {
		'search.espncricinfo.com': {urls: cricinfoURLs, page: cricinfoPage},
	};
	
	// Start queue
	start();
	
	function start() {
		console.log('Bob extracts', 'start', window.location.hostname);
		queue = scrapers[window.location.hostname].urls();
		console.log('Bob extracts', 'start', queue.length);
		if (queue.length > 0) {
			nextPage()
		} else {
			window.setTimeout(start, 1000)
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
		
		var data = scrapers[window.location.hostname].page($(doc));
		
		var row = $('<tr></tr>').appendTo(table);
		$('<td></td>').text(data.name)        .appendTo(row);
		$('<td></td>').text(data.fullName)    .appendTo(row);
		$('<td></td>').text(data.dateOfBirth) .appendTo(row);
		$('<td></td>').text(data.dateOfDeath) .appendTo(row);
		$('<td></td>').text(data.nationality) .appendTo(row);
		$('<td></td>').text(data.sport)       .appendTo(row);
		$('<td></td>').text(data.yearFrom)    .appendTo(row);
		$('<td></td>').text(data.yearTo)      .appendTo(row);
		$('<td></td>').text(response.finalUrl).appendTo(row);
		
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
			} else {
				return (match1[1] + match1[3]) - 0;
			}
		} else if (match2) {
			return match2[0] - 0;
		} else {
			return null
		}
	}
	
	function cleanDate(dateString) {
		if (!dateString) return dateString;
		var trimmedString = dateString.trim();
		var match = trimmedString.match(/^(\w{3,}) (\d{1,2}), (\d{4})$/);
		if (match) return match[2] + ' ' + match[1].substr(0, 3) + ' ' + match[3];
		match = trimmedString.match(/^(\d{1,2}) (\w{3,}) (\d{4})$/);
		if (match) return match[1] + ' ' + match[2].substr(0, 3) + ' ' + match[3];
		return trimmedString;
	}
	
	// ================================================================
	// ESPNcricinfo
	// ================================================================
	
	// https://www.espncricinfo.com/search/_/type/players/q/bob
	// new search results page, only lists 50 Bobs
	function cricinfoURLs__BAD() {
		var links = $('.player__Results__Item a')
			.filter((i,e) => $('.LogoTile__Title', e).text().trim().match(/Bob /));
		return links.toArray().map(a => a.href);
	}
	
	function cricinfoURLs() {
		var links = $('a.ColumnistSmry')
			.filter((i,e) => e.innerText.trim().match(/\(Bob /));
		return links.toArray().map(a => a.href);
	}
	
	//
	function cricinfoPage(doc) {
		console.log('Bob extracts', 'cricinfoPage');
		var data = {};
		
		data.sport = 'Cricket';
		data.name = doc.find('.ciPlayernametxt h1').text().trim();
		data.nationality = doc.find('.ciPlayernametxt h3').text().trim();
		
		$('.ciPlayerinformationtxt', doc).each((i,e) => {
			var fieldName = $('b', e).text().trim();
			var fieldValue = $('span', e).text().trim();
			if (fieldName == 'Full name') {
				data.fullName = fieldValue;
			} else if (fieldName == 'Born') {
				var match = fieldValue.match(/.*?\d{4}/)
				if (match) data.dateOfBirth = cleanDate(match[0]);
			} else if (fieldName == 'Died') {
				var match = fieldValue.match(/.*?\d{4}/)
				if (match) data.dateOfDeath = cleanDate(match[0]);
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
					console.log('Bob extracts', 'cricinfoPage', fieldValue);
					var seasons = fieldValue.match(/^(\S+).*?(\S+)$/);
					var yearFrom = getYearFrom(seasons[1]);
					var yearTo   = getYearTo  (seasons[2]);
					if (!data.yearFrom || yearFrom < data.yearFrom) data.yearFrom = yearFrom;
					if (!data.yearTo   || yearTo   > data.yearTo)   data.yearTo   = yearTo;
				}
			});
		
		return data;
	}
	
})($.noConflict());
