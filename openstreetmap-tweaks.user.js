// ==UserScript==
// @name           OpenStreetMap tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.12.31.0
// @match          https://www.openstreetmap.org/id
// @grant          none
// @require        https://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

//var $sjo = $.noConflict();
$(function() {
	//var $ = $sjo;
	
	console.log('OpenStreetMap tweaks');
	
	$(`<style>
		div.combobox {max-height:368px;}
	</style>`).appendTo('head');
	
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
	
	function presetGarage() {
		console.log('changing type: garage');
		$('.preset-reset.preset-choose').first().click();
		$('.preset-list-item.preset-category-building button').first().click();
		$('.preset-icon-fill-area.tag-building-garage')
			.closest('.preset-list-button').not('.preset-reset').first().click();
	}
	
	function presetGarages() {
		console.log('changing type: garages');
		$('.preset-reset.preset-choose').first().click();
		$('.preset-list-item.preset-category-building button').first().click();
		$('.preset-icon-fill-area.tag-building-garages')
			.closest('.preset-list-button').not('.preset-reset').first().click();
	}
	
	var hotkeys = [
		
		// Ctrl-A: convert node to address node, or enter the address of a building
		{key: 'a', ctrl: true, shift: false, alt: false, fn: () => {
			if ($('.selected').is('g.node')) {
				presetAddress();
			} else if ($('.selected').is('path.area')) {
				enterAddress();
			}
		}},
		
		// Ctrl-H: convert area to house
		{key: 'h', ctrl: true, shift: false, alt: false, fn: () => {
			if ($('.selected').is('path.area')) {
				presetHouse();
				enterAddress();
			}
		}},
		
		// Ctrl-G: convert area to garage
		{key: 'g', ctrl: true, shift: false, alt: false, fn: () => {
			if ($('.selected').is('path.area')) {
				presetGarage();
			}
		}},
		
		// Ctrl-Shift-G: convert area to garages
		{key: 'g', ctrl: true, shift: false, alt: false, fn: () => {
			if ($('.selected').is('path.area')) {
				presetGarages();
			}
		}},
		
	];
		
	// Prevent iD actions on keydown
	$('body').on('keydown', event => {
		var oe = event.originalEvent;
		if (!$('body').is(oe.originalTarget)) return;
		$.each(hotkeys, (index, keydef) => {
			if (keyPressed(event, keydef)) {
				event.preventDefault();
				return false;
			}
		});
	});
	
	// Find matching action on keyup
	$('body').on('keyup', event => {
		var oe = event.originalEvent;
		if (!$('body').is(oe.originalTarget)) return;
		$.each(hotkeys, (index, keydef) => {
			if (keyPressed(event, keydef)) {
				event.preventDefault();
				keydef.fn.call();
				return false;
			}
		});
	});
	
	function keyPressed(event, keydef) {
		var e = event.originalEvent || event;
		return e.key      == keydef.key 
			&& e.ctrlKey  == keydef.ctrl 
			&& e.shiftKey == keydef.shift 
			&& e.altKey   == keydef.alt;
	}
	
});
