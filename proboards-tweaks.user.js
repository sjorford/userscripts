// ==UserScript==
// @name        Proboards tweaks
// @namespace   sjorford@gmail.com
// @include     http://vote-2012.proboards.com/*
// @version     2017-11-06
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		div.ui-form-error + img + style + div[id$="-banner"],
		iframe#rufous-sandbox   + style + div[id$="-banner"],
		div.ui-dialog.ui-widget.ui-widget-content + img + style + div[id$="-overlay"],
		div#support-message
			{display: none !important;}
		tr.bookmarked.new {background-color: #ffd700b3 !important;}
	</style>`).appendTo('head');
	
});
