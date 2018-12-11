// ==UserScript==
// @name           OpenStreetMap tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.12.11.0
// @match          https://www.openstreetmap.org/id
// @grant          none
// @require        https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

//var $sjo = $.noConflict();
$(function() {
	//var $ = $sjo;
	
	$('body').on('keypress', event => {
		var oe = event.originalEvent;
		if (!$('body').is(oe.originalTarget)) return;

		// Change area type to House (Ctrl-H)
		if (oe.key == 'h' && oe.ctrlKey && !oe.shiftKey && !oe.altKey) {
			event.preventDefault();
			presetHouse();
			enterAddress();
			return false;
		}
		
		// Enter address, or change point type to Address (Ctrl-A)
		if (oe.key == 'a' && oe.ctrlKey && !oe.shiftKey && !oe.altKey) {
			event.preventDefault();
			if ($('g.node.point.selected').length > 0) {
				presetAddress();
			} else {
				enterAddress();
			}
			return false;
		}
		
		function presetHouse() {
			console.log('changing type: house');
			$('.preset-reset.preset-choose').first().click();
			$('.preset-list-item.preset-category-building button').first().click();
			$('.preset-icon-fill-area.tag-building-house')
				.closest('.preset-list-button').not('.preset-reset').first().click();
		}
		
		function presetAddress() {
			console.log('changing type: address');
			$('.preset-reset.preset-choose').first().click();
			var button = $('.preset-icon-fill-vertex, .preset-icon-fill-point')
					.filter((i, e) => e.className.split(' ').indexOf('tag-addr:*') >= 0)
					.closest('.preset-list-button').not('.preset-reset').first();
			if (button.length == 0) return;
			button.click();
			enterAddress();
		}
		
		function enterAddress() {
			console.log('moving focus to address fields');
			$('.addr-housenumber').first().focus();
		}
		
	});
	
	
});
