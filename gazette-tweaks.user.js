// ==UserScript==
// @name         Gazette tweaks
// @namespace    sjorford@gmail.com
// @version      2020.02.13.5
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
		html = html.replace(/(Baron(?:ess)? [- 'A-Za-z]+?\b(?: of [- 'A-Za-z]+?\b)?)((?:<\/strong><\/span>)?,| of [- 'A-Za-z]*? in )/g, '<a href="https://en.wikipedia.org/w/index.php?search=$1&title=Special%3ASearch&go=Go&ns0=1">$1</a>$2')
		html = html.replace(/(\d\d?)(st|nd|rd|th)( \w+ \d{4})/g, '$1$3');
		return html;
	});
	
});
