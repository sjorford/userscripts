// ==UserScript==
// @name           Search box shortcut
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2021.03.06.0
// @match          https://emojipedia.org/*
// @match          https://gta.fandom.com/*
// @match          https://www.legislation.gov.uk/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

$(function() {
	
	$('body').on('keydown', event => {
		var oe = event.originalEvent;
		if (oe.key == 'F' && oe.shiftKey && oe.altKey && !oe.ctrlKey) {
			$('[name=q], [name=query], #contentSearch #title').first().focus().select();
			event.preventDefault();
		}
	});
	
});
