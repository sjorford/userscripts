// ==UserScript==
// @name        Proboards tweaks
// @namespace   sjorford@gmail.com
// @include     http://vote-2012.proboards.com/*
// @version     2018.05.07.0
// @grant       none
// ==/UserScript==

$(function() {
	
	$(`<style>
		
		div.ui-form-error     + img + style + div[id$="-banner"],
		iframe#rufous-sandbox       + style + div[id$="-banner"],
		iframe#rufous-sandbox + img + style + div[id$="-banner"],
		div.ui-dialog.ui-widget.ui-widget-content + img + style + div[id$="-overlay"],
		div.ui-dialog.ui-widget.ui-widget-content + img + style + div[id$="-banner"],
		div#support-message,
		div.c-pb-plus__container
			{display: none !important;}
		
		tr.bookmarked.new {background-color: #ffd700b3 !important;}
		tr.new            {background-color: #ffd70066 !important;}
		
		.message br {margin-bottom: 0.5em;}
		
	</style>`).appendTo('head');
	
});
