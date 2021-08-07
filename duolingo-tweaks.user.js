// ==UserScript==
// @name         Duolingo tweaks
// @namespace    sjorford@gmail.com
// @version      2021.08.01.0
// @author       Stuart Orford
// @match        https://www.duolingo.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-league-table {height: auto !important;}
	</style>`).appendTo('head');
	
	var timerLeagueTable = window.setInterval(expandLeagueTable, 1000);
	
	function expandLeagueTable() {
		$('img[src$="/images/leagues/icon_info.svg"]')
			.closest('div:has(hr)')
			.find('hr').next('div')
			.addClass('sjo-league-table');
	}
	
	var timerWordBank = null;
	var longDelay = true;
	var failureCount = 0;
	resetTimer(true);
	
	function resetTimer(_longDelay) {
		longDelay = _longDelay;
		window.clearInterval(timerWordBank);
		return window.setInterval(sortWordBank, longDelay ? 1000 : 100);
		failureCount = 0;
	}
	
	function sortWordBank() {
		
		var wordBank = $('[data-test="word-bank"]').not('.sjo-sorted');
		if (wordBank.length == 0) {
			failureCount++;
			if (!longDelay & failureCount >= 3000) {
				resetTimer(true);
			}
			return;
		}
		
		failureCount = 0;
		if (longDelay) {
			resetTimer(false);
		}
		
		var sortedWords = wordBank.children('div').toArray().sort((a,b) => {
			var textA = a.innerText.toLowerCase().trim();
			var textB = b.innerText.toLowerCase().trim();
			var sort = (textA > textB) ? 1 : (textA < textB) ? -1 : 0;
			return sort;
		});
		wordBank.append(sortedWords).addClass('sjo-sorted');
		
	}
	
});
})(jQuery.noConflict());
