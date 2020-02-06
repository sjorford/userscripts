// ==UserScript==
// @name         Goodreads tweaks
// @namespace    sjorford@gmail.com
// @version      2020.02.06.0
// @author       Stuart Orford
// @match        https://www.goodreads.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

jQuery.noConflict();
jQuery(function() {
	var $ = jQuery;
	
	var shelfOrder = ['read', 'currently-reading', 'to-read', 'fiction', 'non-fiction'];
	
	$(`<style>
		.sjo-shelf {display: block;}
		a.shelfLink[href$="?shelf=fiction"] {background-color: gold;}
		a.shelfLink[href$="?shelf=non-fiction"] {background-color: lightgreen;}
	</style>`).appendTo('head');
	
	setInterval(sortShelves, 500);
	
	function sortShelves() {

		$('[id^="shelfList"]').not('.sjo-sorted').each((i,e) => {
			
			var list = $(e);
			var shelves = list.find('a.shelfLink');
			console.log('sorting ' + list.attr('id') + ', ' + shelves.length + ' shelves');
			
			shelves.each((i,e) => {
				var shelf = $(e);
				if (shelf.parent().is('.sjo-shelf')) {
					// fine
				} else if (shelf.parent().is('[id^="shelf_"]')) {
					shelf.parent().addClass('sjo-shelf')
				} else {
					shelf.wrap('<span class="sjo-shelf"></span>');
				}
			});
			
			var shelvesSorted = shelves.parent('.sjo-shelf').toArray().sort((a,b) => {
				var _a = shelfOrder.indexOf(a.innerText);
				var _b = shelfOrder.indexOf(b.innerText);
				return _a < 0 && _b < 0 ? (a.innerText > b.innerText ? 1 : -1) : _a < 0 ? 1 : _b < 0 ? -1 : _a - _b;
			});
			list.empty().append(shelvesSorted).addClass('sjo-sorted');
			
		});
		
	}
	  
});