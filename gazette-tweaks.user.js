// ==UserScript==
// @name         Gazette tweaks
// @namespace    sjorford@gmail.com
// @version      2020.02.13.1
// @author       Stuart Orford
// @match        https://www.thegazette.co.uk/notice/*
// @match        https://www.thegazette.co.uk/all-notices/*
// @grant        none
// ==/UserScript==

$(function() {
	
	$(`<style>
		
	</style>`).appendTo('head');
	
	$('.content', '.full-notice, .feed-item').html((i,html) => {
		html = html.replace(/\s+/g, ' ').trim();
		html = html.replace(/(Baron(?:ess)? .+?\b(?: of .+?\b)?)(,| of )/g, '<a href="https://en.wikipedia.org/wiki/$1">$1</a>$2')
		html = html.replace(/(\d\d?)(st|nd|rd|th)( \w+ \d{4})/g, '$1$3');
		return html;
	});
	
});
