// ==UserScript==
// @name         Bob extracts
// @namespace    sjorford@gmail.com
// @version      2020.09.15.0
// @author       Stuart Orford
// @match        https://www.espncricinfo.com/search/_/type/players/q/bob
// @run-at       document-idle
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
	
	$(`<style>
		.sjo-wrapper {position: fixed; bottom: 0px; left: 0px; width: 100%;}
		.sjo-box {border: 1px solid blue; width: auto; background-color: white; font-family: Calibri; font-size: 11pt; overflow: scroll; max-height: 200px; padding: 0.5em;}
		.sjo-table td {margin: 0px; padding: 2px 5px;}
	</style>`).appendTo('head');
	
	// Add export table
	var table = $('<table class="sjo-table"></table>')
		.appendTo('body')
		.wrap('<div class="sjo-wrapper"></div>')
		.wrap('<div class="sjo-box"></div>')
		.click(function() {
			selectRange(this);
		});
	
	// Create iframe
	var iframe = $('<iframe></iframe>').appendTo('body').hide().on('load', scrapePage);
	
	// Set up list of functions
	var scrapers = {
		'www.espncricinfo.com': {urls: cricinfoURLs, page: cricinfoPage},
	};
	
	// Start queue
	start();
	
	function start() {
		console.log('Bob extracts', 'start');
		queue = scrapers[window.location.hostname].urls();
		console.log('Bob extracts', 'start', queue);
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
		iframe.attr('src', url);
	}
	
	function scrapePage() {
		console.log('Bob extracts', 'scrapePage');
		var doc = iframe[0].contentDocument;
		console.log('Bob extracts', 'scrapePage', doc);
		if (!doc) return;
		scrapers[window.location.hostname].page($(doc));
		//nextPage();
	}
	
	// ESPNcricinfo
	// ================================================================
	
	function cricinfoURLs() {
		var links = $('.player__Results__Item a');
		return links.toArray().map(a => a.href);
	}
	
	function cricinfoPage(doc) {
		console.log(doc.find('.ciPlayerinformationtxt'));
		
	}
	
})($.noConflict());

