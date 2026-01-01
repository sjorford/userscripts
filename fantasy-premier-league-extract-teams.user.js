// ==UserScript==
// @name           Fantasy Premier League extract teams
// @namespace      sjorford@gmail.com
// @version        2026.01.01.0
// @author         Stuart Orford
// @match          https://fantasy.premierleague.com/leagues/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
	$(function() {
		
		$(`<style>
			.sjo-teams-wrapper {
				position: fixed; right: 0px; top: 0px; height: 100%; width: 30em;
				font-size: small; background-color: white; border: 1px solid black;
				overflow: scroll; z-index: 9999999;
			}
			#sjo-week {
				margin: 0; height: auto; width: 3em; padding: 0; padding-left: 0.5em;
			}
		</style>`).appendTo('head');
		
		// Check for page load
		var timer = window.setInterval(check, 100);
		
		function check() {
			
			var reset = $('span:contains("Reset")');
			if (reset.length == 0) return;
			window.clearInterval(timer);
			
			// Add extract button
			var button = $('<button id="sjo-button" class="u523kl2 u523kl1 u523kl0 u523kl5" data-rac="" type="button" tabindex="0" data-react-aria-pressable="true" aria-label="Extract" id="sjo-extract"><span class="t2sh1k0">Extract</span></button>')
					.click(extract);
			reset.closest('div').append(button);
			
		}
		
		function extract() {
			
			// Add week selector
			var week = $('a[href*="/entry/"]').attr('href').match(/\d{2}$/)[0];
			var weekInput = $(`<input id="sjo-week" type="number" value="${week}">`).insertAfter('#sjo-button')
					.on('change', event => week = weekInput.val());
			
			// Add output table
			var wrapper = $('<div class="sjo-teams-wrapper"></div>').appendTo('body');
			var table = $('<table class="sjo-table"></table>').appendTo(wrapper)
					.click(event => table.selectRange());
			
			var pages = [];
			var rowsPerPage = 90;
			var row = 0;
			
			// Check for team page load
			var timer = window.setInterval(extractPage, 100);
			
			function extractPage() {
				
				var page = window.location.pathname;
				if (pages.indexOf(page) >= 0) return;
				if (!page.match(/^\/entry\/\d+\/event\/\d+/)) return;
				
				var manager = $('h2._1iy1znb1 ~ div').text().trim();
				if (manager == '') return;
				
				// Check gameweek
				var teamWeek = $('h2:contains("Gameweek")').text().trim().match(/[123]?\d$/)[0];
				if (teamWeek != week) return;
				
				var pick = 0;
				var captain = 0;
				var players = [];
				
				// Loop through players
				$('#root picture > source ~ img[src*="shirts"]').each((i,e) => {
					
					pick++;
					
					var img = $(e);
					var club = img.attr('alt').trim();
					var footer = img.closest('picture').next('div');
					var name = footer.children('span').text().trim();
					
					// Get captaincy flag
					var svg = img.closest('button').next('div').find('svg');
					if (pick <= 11 && svg.length > 0) {
						if (svg.has('> circle ~ path').length > 0) {
							captain = pick;
						} else if (svg.has('> circle ~ polygon').length > 0 && captain == 0) {
							captain = pick;
						}
					}
					
					players.push({
						pick: pick,
						name: name,
						club: club,
					});
					
				});
				
				$.each(players, (i, player) => {
					
					row++;
					var symbol = (player.pick == captain) ? '✪' : (player.pick <= 11) ? '●' : '-';
					
					var outputRow = $('<tr></tr>').appendTo(table);
					$('<td></td>').appendTo(outputRow).text(row);
					$('<td></td>').appendTo(outputRow).text(manager);
					$('<td></td>').appendTo(outputRow).text(player.name);
					$('<td></td>').appendTo(outputRow).text(player.club);
					$('<td></td>').appendTo(outputRow).text(symbol);
					
				});
				
				wrapper.prop('scrollTop', wrapper.prop('scrollHeight'));
				
				while (row % rowsPerPage > 0) {
					row++;
					var outputRow = $('<tr></tr>').appendTo(table);
					$('<td></td>').appendTo(outputRow).text(row);
				}
				
				pages.push(page);
				
			}
			
		}
		
	});
})(jQuery);
