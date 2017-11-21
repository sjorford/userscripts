// ==UserScript==
// @name           Quiz Monkey tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2017-11-21
// @match          http://www.quizmonkey.net/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

$(function() {

	$(`<style>.hidden {display: inline-block;}</style>`).appendTo('head');

	$('td[rowspan]').each((index, element) => {
		var td = $(element);
		var rowspan = td.attr('rowspan') - 0;
		td.attr('rowspan', 1);
		td.closest('tr').nextAll('tr').slice(0, rowspan - 1).append(td.clone());
	});
	
	$('.tablecell20 img').attr('alt', '').attr('title', '');
	
});
