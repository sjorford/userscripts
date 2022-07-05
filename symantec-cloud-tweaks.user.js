// ==UserScript==
// @name           Symantec.cloud tweaks
// @namespace      sjorford@gmail.com
// @version        2022.07.05.1
// @author         Stuart Orford
// @match          https://clients.messagelabs.com/Tools/*
// @grant          none
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		#body, #wrap, div.round {width: auto;}
		#header-content, #body-main-content {padding-right: 10px;}
	</style>`).appendTo('head');
	
});
})(jQuery);
