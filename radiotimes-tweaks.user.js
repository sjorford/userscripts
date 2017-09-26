// ==UserScript==
// @name        Radio Times tweaks
// @namespace   sjorford@gmail.com
// @include     http://www.radiotimes.com/*
// @version     2017-09-26
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		
		link[href*="d7f3fb657c"] + script + script + script + script + div,
		link[href*="d7f3fb657c"] + script + script + script + script + div + div,
		link[href*="d7f3fb657c"] + div,
		link[href*="d7f3fb657c"] + div + div
			{display: none !important;}
			
		html, body {overflow-y: auto !important;}
			
	</style>`).appendTo('head');
	
});
