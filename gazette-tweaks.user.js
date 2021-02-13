// ==UserScript==
// @name         Gazette tweaks
// @namespace    sjorford@gmail.com
// @version      2020.02.13.0
// @author       Stuart Orford
// @match        https://www.thegazette.co.uk/notice/*
// @grant        none
// ==/UserScript==

$(function() {
	
	$(`<style>
		
	</style>`).appendTo('head');
	
	$('.full-notice .content').html((i,html) => {
		html = html.replace(/\s+/g, ' ').trim();
		console.log(html);
		html = html.replace(/(Baron(?:ess)? .+?\b(?: of .+?\b)?)(,| of )/g, '<a href="https://en.wikipedia.org/wiki/$1">$1</a>$2')
		console.log(html);
		return html;
	});
	
});
