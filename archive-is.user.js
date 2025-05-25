// ==UserScript==
// @name           archive.is
// @namespace      sjorford@gmail.com
// @version        2025.05.25.0
// @author         Stuart Orford
// @match          https://www.ft.com/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	if ($('#charge-button').length > 0) {
		window.location = `https://archive.is/search/?q=${encodeURIComponent(window.location.href)}`
	}
	
});
})(jQuery);
