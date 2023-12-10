// ==UserScript==
// @name           A2z Word Finder tweaks
// @namespace      sjorford@gmail.com
// @version        2023.12.10.0
// @author         Stuart Orford
// @match          https://www.a2zwordfinder.com/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		
	</style>`).appendTo('head');
	
	window.setInterval(linkResults, 250);
	
	function linkResults() {
		$('[id$="-solver-results"]').find('b > br, b > font').each((i,e) => {
			var textNode = e.nextSibling;
			if (textNode && textNode.nodeType == Node.TEXT_NODE) {
				$(e).after('<span class="sjo-wiktionary-links">' + textNode.nodeValue.replace(/[a-z]+/g, '<a href="https://en.wiktionary.org/wiki/$&">$&</a>') + '</span>');
				textNode.nodeValue = '';
			}
		});
	}
	
});
})(jQuery);
