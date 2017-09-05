// ==UserScript==
// @name        Proboards tweaks
// @namespace   sjorford@gmail.com
// @include     http://vote-2012.proboards.com/*
// @version     2017-09-05
// @grant       none
// ==/UserScript==

$(function() {
	
	$(`<style>
		div.ui-form-error + img + style + div[id$="-banner"] {display: none !important;}
	</style>`).appendTo('head');
	
});
