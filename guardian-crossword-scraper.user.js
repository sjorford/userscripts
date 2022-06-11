// ==UserScript==
// @name           Guardian crossword scraper
// @namespace      sjorford@gmail.com
// @version        2022.03.24.0
// @author         Stuart Orford
// @match          https://www.theguardian.com/profile/*
// @match          https://www.theguardian.com/crosswords/series/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-extract-wrapper {
			position: fixed;
			width: 100%;
			height: 200px;
			bottom: 0px;
			left: 0px;
			background-color: white;
			font-size: 9pt;
			z-index: 9999;
			overflow: scroll;
		}
		.sjo-extract-table td {
			padding: 0.25em;
		}
		.sjo-status {margin-left: 1em;}
	</style>`).appendTo('head');
	
	$('<input type="button" value="Extract all">').appendTo('.index-page-header')
		.click(extractAll).after('<span class="sjo-status"></span>');
	
	function extractAll() {
		
		// Create extract table
		var table = $('<table class="sjo-extract-table"></table>')
			.appendTo('body').wrap('<div class="sjo-extract-wrapper"></div>')
			.click(event => table.selectRange());

		// Parse this page
		parsePage($('.index-page'));
		
	}
	
	function parsePage(content) {
		
		var setter = $('h1', content).text().trim();
		
		var items = $('li.u-faux-block-link:has(> div[data-id^="crosswords/"])', content);
		console.log(setter, items.length);
		
		items.each((i,e) => {
			
			var item = $(e);
			var type = item.find('.fc-item__kicker').text().trim();
			var numMatch = item.find('.fc-item__headline').text().match(/([\d,]+)/);
			var num  = numMatch ? numMatch[1] : '';
			var date = item.find('.fc-item__timestamp').attr('datetime').replace(/T.*/, '');
			
			var row = $('<tr></tr>').appendTo('.sjo-extract-table');
			$('<td></td>').text(setter).appendTo(row);
			$('<td></td>').text(type)  .appendTo(row);
			$('<td></td>').text(num)   .appendTo(row);
			$('<td></td>').text(date)  .appendTo(row);
			
		});
		
		// Find next page
		var next = $('.pagination__action.is-active', content).next('.pagination__action');
		if (next.length == 0) return;
		var url = next.attr('href');
		if (!url) return;
		console.log(url);
		$('.sjo-status').text('Getting ' + url);
		$.get(url, data => parsePage($('.index-page', data)));
	
	}
	
});
})(jQuery.noConflict());
