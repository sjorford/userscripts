// ==UserScript==
// @name           Search box shortcut
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2020.04.13.0
// @match          https://emojipedia.org/*
// @match          https://gta.fandom.com/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

$(function() {
	
	$('body').on('keydown', event => {
		var oe = event.originalEvent;
		if (oe.key == 'F' && oe.shiftKey && oe.altKey && !oe.ctrlKey) {
			$('[name=q], [name=query]').first().focus().select();
			event.preventDefault();
		}
	});
	
});
