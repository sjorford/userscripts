// ==UserScript==
// @name           Cheshire East map tweaks
// @namespace      sjorford@gmail.com
// @version        2022.07.18.0
// @author         Stuart Orford
// @match          https://maps.cheshireeast.gov.uk/ce/webmapping
// @grant          none
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		#popup-content td {
			padding: 0.25em !important;
		}
	</style>`).appendTo('head');
	
});
})(jQuery);
