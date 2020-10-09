// ==UserScript==
// @name        Proboards tweaks
// @namespace   sjorford@gmail.com
// @include     http://vote-2012.proboards.com/*
// @include     https://vote-2012.proboards.com/*
// @version     2020.10.09.0
// @grant       none
// ==/UserScript==

$(function() {
	
	$(`<style>
		
		div[id$="-banner"],
		div[id$="-overlay"],
		div#support-message,
		div.c-pb-plus__container
			{display: none !important;}
		
		body {
			overflow: auto !important,
			position: revert !important
		}
		
		tr.bookmarked.new {background-color: #ffd700b3 !important;}
		tr.new            {background-color: #ffd70066 !important;}
		
		.message br {margin-bottom: 0.5em;}
		
		.post .content article h3.title {display: none;}
		
	</style>`).appendTo('head');
	
});
