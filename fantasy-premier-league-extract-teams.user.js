// ==UserScript==
// @name           Fantasy Premier League extract teams
// @namespace      sjorford@gmail.com
// @version        2025.10.25.0
// @author         Stuart Orford
// @match          https://fantasy.premierleague.com/leagues/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
	$(function() {
		
		$(`<style>
			.sjo-wrapper {
				position: fixed; right: 0px; top: 0px; height: 100%; width: 30em;
				font-size: small; background-color: white; border: 1px solid black;
				overflow: scroll; z-index: 9999999;
			}
		}
		</style>`).appendTo('head');
		
		var timer = window.setInterval(check, 100);
		
		function check() {
			
			var reset = $('span:contains("Reset")');
			if (reset.length == 0) return;
			window.clearInterval(timer);
			
			var button = $('<button class="u523kl2 u523kl1 u523kl0 u523kl5" data-rac="" type="button" tabindex="0" data-react-aria-pressable="true" aria-label="Extract" id="sjo-extract"><span class="t2sh1k0">Extract</span></button>')
					.click(extract);
			reset.closest('div').append(button);
			
		}
		
		function extract() {
			
			var table = $('<table class="sjo-table"></table>')
					.appendTo('body').wrap('<div class="sjo-wrapper"></div>')
					.click(event => table.selectRange());
			
			var pages = [];
			
			var timer = window.setInterval(extractPage, 100);
			
			function extractPage() {
				
				var page = window.location.pathname;
				if (pages.indexOf(page) >= 0) return;
				if (!page.match(/^\/entry\/\d+\/event\/\d+/)) return;
				
				var manager = $('a:contains("Report Offensive Name")').prev('div').find('h2 ~ div').text().trim();
				console.log('page', page);
				console.log(manager);
				if (manager == '') return;
				
				var pick = 0;
				
				$('#root picture > source ~ img').each((i,e) => {
					
					pick++;
					
					var img = $(e);
					var club = img.attr('alt').trim();
					var footer = img.closest('picture').next('div');
					var player = footer.children('span').text().trim();
					var points = footer.find('div[data-fixture-bar] > span[aria-hidden]').text().trim();
					
					var outputRow = $('<tr></tr>').appendTo(table);
					$('<td></td>').appendTo(outputRow).text(manager);
					$('<td></td>').appendTo(outputRow).text(player);
					$('<td></td>').appendTo(outputRow).text(club);
					$('<td></td>').appendTo(outputRow).text(points);
					$('<td></td>').appendTo(outputRow).text(pick <= 11 ? '●' : '-');
					
				});
				
				pages.push(page);
				
			}
			
		}
		
	});
})(jQuery);
