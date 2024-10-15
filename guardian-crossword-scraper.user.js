// ==UserScript==
// @name           Guardian crossword scraper
// @namespace      sjorford@gmail.com
// @version        2024.10.15.0
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
	
	$('<input type="button" value="Extract all">').prependTo('#maincontent')
		.click(extractAll).after('<span class="sjo-status"></span>');
	
	function extractAll() {
		
		// Create extract table
		var table = $('<table class="sjo-extract-table"></table>')
			.appendTo('body').wrap('<div class="sjo-extract-wrapper"></div>')
			.click(event => table.selectRange());

		// Parse this page
		parseIndexPage($('#maincontent'));
		
	}
	
	function parseIndexPage(content) {
		
		// Get list of URLs
		//var items = $('.fc-item[data-id^="crosswords/"] .fc-item__title a[data-link-name="article"]', content);
		var items = $('[id^="container-"] [href*="/crosswords/"]', content).not('[href*="#comment"]');
		var urls = items.toArray().map(e => e.href);
		
		getCrossword();
		
		function getCrossword() {
			if (urls.length == 0) {
				getNextIndexPage();
			} else {
				var url = urls.shift();
				$('.sjo-status').text('Getting ' + url);
				$.get(url, data => parseCrossword($('article#crossword', data)));
			}
		}
		
		function parseCrossword(content) {
			console.log(content);
			
			var setter = $('.crossword__links .byline span[itemprop="name"]', content).text().trim();
			var match = $('h1', content).text().trim().match(/^(.+) crossword No ([\d,]+)$/);
			var type = match ? match[1] : '';
			var num  = match ? match[2] : '';
			var date = ($('.crossword__links time[itemprop="datePublished"]', content).attr('datetime') || '').replace(/T.*/, '');
			
			/*
			var grid = Array(15).fill(0).map(a => Array(15).fill('■'));
			
			var gridHTML = $('.crossword__container__grid-wrapper > noscript', content).text();
			var cells = $('g.cells rect', $(gridHTML));
			
			var spacing = parseInt(cells[0].width.baseVal.value, 10) + 1;
			cells.each((i,cell) => {
				var col = (cell.x.baseVal.value - 1) / spacing;
				var row = (cell.y.baseVal.value - 1) / spacing;
				grid[row][col] = '□';
			});
			var gridFlat = grid.map(a => a.join('')).join(' ');
			*/
			
			var row = $('<tr></tr>').appendTo('.sjo-extract-table');
			$('<td></td>').text(setter)  .appendTo(row);
			$('<td></td>').text(type)    .appendTo(row);
			$('<td></td>').text(num)     .appendTo(row);
			$('<td></td>').text(date)    .appendTo(row);
			//$('<td></td>').text(gridFlat).appendTo(row);
			
			getCrossword();
			
		}
		
		function getNextIndexPage() {
			var next = $('.pagination__action.is-active', content).next('.pagination__action');
			if (next.length == 0) return;
			var url = next.attr('href');
			if (!url) return;
			console.log(url);
			$('.sjo-status').text('Getting ' + url);
			window.setTimeout(() => $.get(url, data => parseIndexPage($('.index-page', data))), 3000);
		}
		
	}
	
});
})(jQuery);
