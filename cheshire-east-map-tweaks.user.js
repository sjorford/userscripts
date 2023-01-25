// ==UserScript==
// @name           Cheshire East map tweaks
// @namespace      sjorford@gmail.com
// @version        2023.01.25.0
// @author         Stuart Orford
// @match          https://maps.cheshireeast.gov.uk/ce/webmapping
// @grant          none
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.ol-viewport #popup-content {min-width: 300px !important;}
		.ol-viewport #popup-content td {padding: 0.25em !important;}
		.ol-viewport .panel-body {display: none !important;}
		.ol-viewport .table {margin: 0 !important;}
		.ol-viewport .ol-popup {padding: 15px 0 0 0 !important;}
		.ol-viewport [id^="identpopup_"] {padding: 0 !important;}
	</style>`).appendTo('head');
	
});
})(jQuery);
