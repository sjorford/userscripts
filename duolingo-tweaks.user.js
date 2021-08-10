// ==UserScript==
// @name         Duolingo tweaks
// @namespace    sjorford@gmail.com
// @version      2021.08.10.0
// @author       Stuart Orford
// @match        https://www.duolingo.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-league-table {height: auto !important;}
		.sjo-history-button {position: fixed; top: 1em; right: 1em; z-index: 200;}
		.blocker {z-index: 201 !important;}
		.modal   {z-index: 202 !important;}
	</style>`).appendTo('head');
	
	// Expand league table to full height
	var timerLeagueTable = window.setInterval(expandLeagueTable, 1000);
	
	function expandLeagueTable() {
		$('img[src$="/images/leagues/icon_info.svg"]')
			.closest('div:has(hr)')
			.find('hr').next('div')
			.addClass('sjo-league-table');
	}
	
	// Sort word bank alphabetically
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
	
	// Show history in a modal dialog
	$('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-modal/0.9.1/jquery.modal.min.css">').appendTo('head');
	
	var historyTimer = window.setInterval(updateHistory, 200);
	var historyButton = $('<a class="sjo-history-button" href="#sjo-history-modal" rel="modal:open">History</a>').appendTo('body');
	var historyModal = $('<div id="sjo-history-modal" class="modal"></div>').appendTo('body');
	
	function updateHistory() {
		
		if (!(window.location.href.match(/\/skill\//))) {
			historyButton.hide();
			historyModal.empty();
			return;
		}
		
		historyButton.show();
		
		var hints = $('[data-test="hint-sentence"]').not('.sjo-logged').parent().children().not('label');
		if (hints.length > 0) {
			var text = hints.toArray().map(e => {
				if (e.getAttribute('data-test') == 'hint-sentence') return e.innerText;
				if (e.innerText.length > 0) return e.innerText + ' ';
				return '_____';
			}).join('');
			$('<p></p>').text(text).appendTo(historyModal);
			hints.addClass('sjo-logged');
		}
		
		$('[data-test="challenge-judge-text"]').not('.sjo-logged').each((i,e) => {
			$('<p></p>').text(e.innerText).appendTo(historyModal);
		}).addClass('sjo-logged');
		
		$('[data-test="blame blame-correct"], [data-test="blame blame-incorrect"]').find('h2 + div').not('.sjo-logged').each((i,e) => {
			$('<p></p>').text(e.innerText).appendTo(historyModal);
		}).addClass('sjo-logged');
		
	}
	
});
})(jQuery.noConflict());
