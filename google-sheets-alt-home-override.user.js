// ==UserScript==
// @name           Google Sheets Alt+Home override
// @namespace      sjorford@gmail.com
// @version        2025.02.16.0
// @author         Stuart Orford
// @match          https://docs.google.com/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	$('body').on('keydown', event => {
		if (event.originalEvent.key == 'Home' && event.originalEvent.altKey ==  true) {
			event.preventDefault;
			return false;
		}
	});
});
})(jQuery);
