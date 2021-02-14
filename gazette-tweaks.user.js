// ==UserScript==
// @name         Gazette tweaks
// @namespace    sjorford@gmail.com
// @version      2020.02.14.2
// @author       Stuart Orford
// @match        https://www.thegazette.co.uk/notice/*
// @match        https://www.thegazette.co.uk/all-notices/*
// @grant        none
// ==/UserScript==

$(function() {
	
	$(`<style>
		
	</style>`).appendTo('head');
	
	$('.content', '.full-notice, .feed-item').html((i,html) => {
		html = html.replace(/\s+/g, ' ').trim().replace(/’/g, "'");
		html = html.replace(/(Baron(?:ess)? [- 'A-Za-z]+?\b(?: of [- 'A-Za-z\.]+?\b)?)((?:<\/strong><\/span>)?,| of [- 'A-Za-z\.]*? in )/gi, '<a href="https://en.wikipedia.org/w/index.php?search=$1&title=Special%3ASearch&go=Go&ns0=1">$1</a>$2')
		html = html.replace(/llth/g, '11th');
		html = html.replace(/(\d\d?)(?:(?:st|nd|rd|th)(?:(?: day)? of)?)?(?: (\w+),? (\d{4}))/g, '<span style="white-space: nowrap;">$1 $2 $3</span>');
		return html;
	});
	
});
