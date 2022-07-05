// ==UserScript==
// @name           Symantec.cloud tweaks
// @namespace      sjorford@gmail.com
// @version        2022.07.05.0
// @author         Stuart Orford
// @match          https://clients.messagelabs.com/Tools/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		#body, #wrap, div.round {width: auto;}
		#header-content, #body-main-content {padding-right: 10px;}
	</style>`).appendTo('head');
	
});
})(jQuery);
