// ==UserScript==
// @name           LGBCE tweaks
// @namespace      sjorford@gmail.com
// @version        2018.11.02.0
// @match          https://www.lgbce.org.uk/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

$('.field--name-field-review-dates td').each((index, element) => {
	
	var td = $(element);
	td.html(td.html().replace(/(\d)(th|nd|rd|st) /, '$1 '));
	td.find('br').remove();
	
});
