// ==UserScript==
// @name           New Statesman tweaks
// @namespace      sjorford@gmail.com
// @version        2021.05.07.0
// @author         Stuart Orford
// @match          https://www.newstatesman.com/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.tns-modal-wrapper {display: none !important;}
		body.tns-modal-active {overflow: auto !important;}
		body.tns-modal-active::after {display: none !important;}
	</style>`).appendTo('head');
	
});
})(jQuery.noConflict());
