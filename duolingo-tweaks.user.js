// ==UserScript==
// @name         Duolingo tweaks
// @namespace    sjorford@gmail.com
// @version      2021.07.23.0
// @author       Stuart Orford
// @match        https://www.duolingo.com/learn
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-league-table {height: auto !important;}
	</style>`).appendTo('head');
	
	window.setInterval(bonk, 1000);
	
	function bonk() {
		$('img[src$="/images/leagues/icon_info.svg"]')
			.closest('div:has(hr)')
			.find('hr').next('div')
			.addClass('sjo-league-table');
	}
	
});
})(jQuery.noConflict());
