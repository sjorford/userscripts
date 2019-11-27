// ==UserScript==
// @name           Ladbrokes extract
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2019.11.27.0
// @match          https://sports.ladbrokes.com/event/politics/uk/uk-politics/general-election-constituency-betting/227804290/all-markets
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @grant          none
// ==/UserScript==

// Select range
(function($) {
	$.fn.selectRange = function() {
		var range = document.createRange();
		range.selectNodeContents(this.get(0));
		var selection = getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		return this;
	};
})($);

$(function() {
	
	$(`<style>
	.sjo-wrapper {
		position: fixed;
		left: 0px;
		bottom: 0px;
		height: 200px;
		width: 100%;
z-index: 999999;
		background-color: white;
border: 1px solid black;
		font-size: small;
	}
	</style>`).appendTo('head');
	
	// Create table
	var table = $('<table class="sjo-table"></table>')
		.appendTo('body').wrap('<div class="sjo-wrapper"></div>')
		.click(event => table.selectRange());
	
	// Wait for accordions to load
	var timer = window.setInterval(checkPageLoaded, 1000);
	console.log(timer);
	
	function checkPageLoaded() {
		
		var accordions = $('event-markets accordion');
		if (accordions.length > 0) {
			console.log('accordions loaded');
			window.clearInterval(timer);
			accordions.not('.is-expanded').find('.accordion-header').click();
			timer = window.setInterval(checkOddsLoaded, 1000);
		}
		
	}
	
	function checkOddsLoaded() {
		
		var markets = $('event-markets accordion-body').not('.sjo-processed');
		if (markets.length > 0) {
			console.log(markets.length + ' markets found');
			
			// Extract odds
			markets.addClass('sjo-processed').each((i,e) => {
				
				var constituency = $(e).closest('accordion').find('.header-title').text();
				var candidates = $('.odds-card', e)
				
				candidates.each((i,e) => {
					
					var party = $('.odds-names', e).text();
					var odds = $('.odds-price', e).text().split('/');
					
					var row = $('<tr></tr>').appendTo(table);
					$('<td></td>').appendTo(row).text(constituency);
					$('<td></td>').appendTo(row).text(party);
					$('<td></td>').appendTo(row).text(odds[0]);
					$('<td></td>').appendTo(row).text(odds[1]);
					
				});
				
			});
			
		}
		
	}
	
});
