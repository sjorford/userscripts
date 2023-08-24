// ==UserScript==
// @name           HoC Library boundary maps
// @namespace      sjorford@gmail.com
// @version        2023.08.24.0
// @author         Stuart Orford
// @match          https://commonslibrary.parliament.uk/boundary-review-2023-which-seats-will-change/
// @match          https://commonslibrary.shinyapps.io/new_constituencies_insight/
// @grant          none
// ==/UserScript==

(function($) {
$(function() {
	
	console.log(window.location.href);
	
	var iframe = $('iframe');
	iframe.removeAttr('height');
	
	$(`<style>
		
		.leaflet-pane.leaflet-tooltip-pane .leaflet-tooltip {
			display: none !important;
			xxxdisplay: table-column !important;
			xxxtransform-style: preserve3d;
			xxxtransform: none !important;
		}
		
	</style>`).appendTo('head');
	
});
})(jQuery);
