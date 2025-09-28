// ==UserScript==
// @name           Fantasy Premier League extract
// @namespace      sjorford@gmail.com
// @version        2025.09.28.3
// @author         Stuart Orford
// @match          https://fantasy.premierleague.com/statistics
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
	$(function() {
		
		var posMap = {
			1: 'GK', 
			2: 'DF', 
			3: 'MF', 
			4: 'FW',
		};
		
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
				
				var teamsMap = {};
				$.each(data.teams, (i,team) => {
					teamsMap[team.id] = team.name;
				});
				
				var maxWeek = Math.max(...data.events.filter(week => week.finished == true && week.data_checked == true).map(week => week.id));
				
				var players = data.elements; //.filter(player => player.total_points != 0);
				var count = 0;
				nextPlayer();
				
				function nextPlayer() {
					
					if (players.length == 0) return;
					var player = players.shift();
					count ++;
					
					$.get(`/api/element-summary/${player.id}/`, processPlayerHistory);
					
					function processPlayerHistory(data) {
						
						var weekPoints = [];
						var totalPoints = 0;
						
						for (var week = 1; week <= maxWeek; week++) {
							var weekData = data.history.filter(history => history.round == week);
							if (weekData.length > 0) {
								weekPoints[week] = weekData[0].total_points;
								totalPoints += weekData[0].total_points;
							}
						}
						
						var outputRow = $('<tr></tr>').appendTo(table);
						$('<td></td>').appendTo(outputRow).text(player.code);
						$('<td></td>').appendTo(outputRow).text(player.web_name);
						$('<td></td>').appendTo(outputRow).text((player.first_name + ' ' + player.second_name).trim());
						$('<td></td>').appendTo(outputRow).text(teamsMap[player.team]);
						$('<td></td>').appendTo(outputRow).text(posMap[player.element_type]);
						$('<td></td>').appendTo(outputRow).text(player.now_cost / 10);
						$('<td></td>').appendTo(outputRow).text(totalPoints);
						$('<td></td>').appendTo(outputRow).text(player.news == '' ? '' : '[' + player.news_added.substr(0, 10) + '] ' + player.news);
						
						for (var week = 1; week <= maxWeek; week++) {
							$('<td></td>').appendTo(outputRow).text(weekPoints === undefined ? '' : weekPoints[week]);
						}
						
						//if (count >= 5) return;
						nextPlayer();
						
					}
					
				}
				
			}
			
		}
		
	});
})(jQuery);
