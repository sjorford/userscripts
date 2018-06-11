// ==UserScript==
// @name           Betteridge filter
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @match          http://www.theguardian.com/*
// @match          https://www.theguardian.com/*
// @version        2018.06.11.0
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	var hidden = $('.fc-item__content').filter((i, e) => $(e).text().trim().substr(-1) == '?').closest('.fc-slice__item').hide();
	if (hidden.length > 0) {
		console.log(`Betteridge has hidden ${hidden.length} articles ${'👍'.repeat(hidden.length)}`);
	}
	
});
