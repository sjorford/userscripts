// ==UserScript==
// @name           Fantasy Premier League extract
// @namespace      sjorford@gmail.com
// @version        2025.09.28.0
// @author         Stuart Orford
// @match          https://fantasy.premierleague.com/statistics
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
	$(function() {
		
		var posMap = ['GK', 'DF', 'MF', 'FW'];
		var teamsMap = [
			"Arsenal", 
			"Aston Villa", 
			"Bournemouth", 
			"Brentford", 
			"Brighton", 
			"Burnley", 
			"Chelsea", 
			"Crystal Palace", 
			"Everton", 
			"Fulham", 
			"Leeds", 
			"Liverpool", 
			"Man City", 
			"Man Utd", 
			"Newcastle", 
			"Nott'm Forest", 
			"Spurs", 
			"Sunderland", 
			"West Ham", 
			"Wolves", 
		];
		
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
			
			$.get('/api/bootstrap-static/', processPlayerList);
			
			function processPlayerList(data) {
				var players = data.elements.filter(player => player.total_points != 0);
				var count = 0;
				nextPlayer();
				
				function nextPlayer() {
					if (players.length == 0) return;
					var player = players.shift();
					count ++;
					
					var outputRow = $('<tr></tr>').appendTo(table);
					$('<td></td>').appendTo(outputRow).text(player.id);
					$('<td></td>').appendTo(outputRow).text(player.web_name);
					$('<td></td>').appendTo(outputRow).text((player.first_name + ' ' + player.second_name).trim());
					$('<td></td>').appendTo(outputRow).text(teamsMap[player.team - 1]);
					$('<td></td>').appendTo(outputRow).text(posMap[player.element_type - 1]);
					$('<td></td>').appendTo(outputRow).text(player.total_points);
					$('<td></td>').appendTo(outputRow).text(player.now_cost);
					
					if (player.news != '') {
						$('<td></td>').appendTo(outputRow).text('[' + player.news_added.substr(0, 10) + '] ' + player.news);
					}
					
					$.get(`/api/element-summary/${player.id}/`, processPlayerHistory);
					
					function processPlayerHistory(data) {
						
						var weekPoints = data.history.map(week => week.total_points);
						$.each(weekPoints, (i,points) => {
							$('<td></td>').appendTo(outputRow).text(points);
						});
						
						//if (count >= 50) return;
						nextPlayer();
					}
					
				}
				
			}
			
		}
		
	});
})(jQuery);
