// ==UserScript==
// @name           OpenStreetMap tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.12.01.0
// @match          https://www.openstreetmap.org/id
// @grant          none
// @require        https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

//var $sjo = $.noConflict();
$(function() {
	//var $ = $sjo;
	
	$('body').on('keypress', event => {
		var oe = event.originalEvent;
		
		// Change building type to house (Ctrl-H)
		if (oe.key == 'h' && oe.ctrlKey && !oe.shiftKey && !oe.altKey) {
			event.preventDefault();
			house();
			address();
			return false;
		}
		
		// Enter address (Ctrl-A)
		if (oe.key == 'a' && oe.ctrlKey && !oe.shiftKey && !oe.altKey) {
			event.preventDefault();
			address();
			return false;
		}
		
		function house() {
			console.log('changing type: house');
			$('.preset-reset.preset-choose').first().click();
			$('.preset-list-item.preset-category-building button').first().click();
			$('.preset-icon-fill-area.tag-building-house')
				.closest('.preset-list-button').not('.preset-reset').first().click();
		}
		
		function address() {
			console.log('moving focus to address fields');
			$('.addr-housenumber').first().focus();
		}
		
	});
	
	
});
