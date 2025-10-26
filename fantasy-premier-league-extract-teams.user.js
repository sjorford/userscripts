// ==UserScript==
// @name           Fantasy Premier League extract teams
// @namespace      sjorford@gmail.com
// @version        2025.10.26.0
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
			
			var wrapper = $('<div class="sjo-wrapper"></div>').appendTo('body');
			var table = $('<table class="sjo-table"></table>').appendTo(wrapper)
					.click(event => table.selectRange());
			
			var pages = [];
			
			var timer = window.setInterval(extractPage, 100);
			
			function extractPage() {
				
				var page = window.location.pathname;
				if (pages.indexOf(page) >= 0) return;
				if (!page.match(/^\/entry\/\d+\/event\/\d+/)) return;
				
				var manager = $('h2._1iy1znb1 ~ div').text().trim();
				if (manager == '') return;
				
				var pick = 0;
				
				$('#root picture > source ~ img[src*="shirts"]').each((i,e) => {
					
					pick++;
					
					var img = $(e);
					var club = img.attr('alt').trim();
					var footer = img.closest('picture').next('div');
					var player = footer.children('span').text().trim();
					var captain = img.closest('button').next('div').has('svg[aria-label="Captain"]').length > 0;
					
					var outputRow = $('<tr></tr>').appendTo(table);
					$('<td></td>').appendTo(outputRow).text(manager);
					$('<td></td>').appendTo(outputRow).text(player);
					$('<td></td>').appendTo(outputRow).text(club);
					$('<td></td>').appendTo(outputRow).text(captain ? '✪' : pick <= 11 ? '●' : '-');
					
				});
				
				wrapper.prop('scrollTop', wrapper.prop('scrollHeight'));
				
				pages.push(page);
				
			}
			
		}
		
	});
})(jQuery);
