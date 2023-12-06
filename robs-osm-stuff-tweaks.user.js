// ==UserScript==
// @name           Rob's OSM Stuff tweaks
// @namespace      sjorford@gmail.com
// @version        2023.12.06.0
// @author         Stuart Orford
// @match          https://osm.mathmos.net/survey/
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		#map#map {
			width: 100%;
			max-width: 100em;
			height: 60em;
		}
	</style>`).appendTo('head');
	
});
})(jQuery);
