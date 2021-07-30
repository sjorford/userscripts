// ==UserScript==
// @name         Duolingo tweaks
// @namespace    sjorford@gmail.com
// @version      2021.07.29.0
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
	
	var delayWordBank = 100;
	var timerWordBank = window.setInterval(sortWordBank, delayWordBank);
	var noWordBank = 0;
	
	function sortWordBank() {
		
		var wordBank = $('[data-test="word-bank"]').not('.sjo-sorted');
		if (wordBank.length == 0) {
			noWordBank++;
			if (noWordBank >= 300 && delayWordBank == 100) {
				window.clearInterval(timerWordBank);
				delayWordBank = 1000;
				timerWordBank = window.setInterval(sortWordBank, delayWordBank);
			}
			return;
		} else {
			if (delayWordBank > 100) {
				window.clearInterval(timerWordBank);
				delayWordBank = 100;
				timerWordBank = window.setInterval(sortWordBank, delayWordBank);
				noWordBank = 0;
			}
		}
		
		wordBank.addClass('sjo-sorted');
		var sortedWords = wordBank.children('div').toArray().sort((a,b) => {
			var textA = a.innerText.toLowerCase().trim();
			var textB = b.innerText.toLowerCase().trim();
			var sort = (textA > textB) ? 1 : (textA < textB) ? -1 : 0;
			return sort;
		});
		
		wordBank.append(sortedWords);
		
	}
	
});
})(jQuery.noConflict());
