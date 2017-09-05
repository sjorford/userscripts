// ==UserScript==
// @name        Proboards tweaks
// @namespace   sjorford@gmail.com
// @include     http://vote-2012.proboards.com/*
// @version     2017-09-05b
// @grant       none
// ==/UserScript==

$(function() {
	
	$(`<style>
		div.ui-form-error + img + style + div[id$="-banner"],
		div.ui-dialog.ui-widget.ui-widget-content + img + style + div[id$="-overlay"],
		#support-message
			{display: none !important;}
	</style>`).appendTo('head');
	
});
