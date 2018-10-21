// ==UserScript==
// @name           Streetmap tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.10.21.0
// @match          http://streetmap.co.uk/map.srf*
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	var zoomOutButton = $('#controls_right_zoom_minus');
	var zoomInButton = $('#controls_right_zoom_plus');
	
	$('#SMap').on('wheel', wheelZoom);
	
	function wheelZoom(event) {
		
		if (event.originalEvent.ctrlKey || event.originalEvent.shiftKey || event.originalEvent.altKey) return;
		
		event.preventDefault();
		
		//console.log(event);
		if (event.originalEvent.deltaY > 0) {
			zoomOutButton.click();
		} else if (event.originalEvent.deltaY < 0) {
			zoomInButton.click();
		}
		
	}
	
});
