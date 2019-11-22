// ==UserScript==
// @name         Mapit tweaks
// @namespace    sjorford@gmail.com
// @version      2019.11.22.0
// @author       Stuart Orford
// @match        https://mapit.mysociety.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

$(function() {
	
	$('<style>li.sjo-wmc {background-color: gold;}</style>').appendTo('head')
	
	$('small:contains("(WMC)")').closest('li').addClass('sjo-wmc');
	
});
