// ==UserScript==
// @name           Medium tweaks
// @namespace      sjorford@gmail.com
// @version        2022.11.10.0
// @author         Stuart Orford
// @match          https://medium.com/britainelects/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		
	</style>`).appendTo('head');
	
	$('article, article *').contents().filter((i,e) => e.nodeType == Node.TEXT_NODE && e.textContent.match(/Burr+nley/)).each((i,e) => e.textContent = e.textContent.replace(/Burr+nley/g, 'Burnley'));
	
});
})(jQuery);
