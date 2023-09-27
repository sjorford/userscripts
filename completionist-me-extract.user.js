// ==UserScript==
// @name           completionist.me extract
// @namespace      sjorford@gmail.com
// @version        2023.09.27.0
// @author         Stuart Orford
// @match          https://completionist.me/steam/profile/76561198057191932/apps?*
// @grant          none
//// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-wrapper {background-color: white; color: black;}
		.sjo-wrapper td {padding: 0 0.5em;}
	</style>`).appendTo('head');
	
	var outputTable = $('<table class="sjo-table"></table>').appendTo('body')
			.wrap('<div class="sjo-wrapper"></div>')
			.click(() => outputTable.selectRange());
	
	var page = 1
	var maxPage = $('.pagination a').last().attr('href').match(/\d+$/)[0] - 0;
	
	download();
	
	function download() {
		$.get('https://completionist.me/steam/profile/76561198057191932/apps?display=flat&sort=last-unlock&order=desc&page=' + page, extract);
	}
	
	function extract(data) {
		
		var doc = $(data);
		
		var gamesTable = $('.games-list-flat table', doc);
		console.log(gamesTable);
		
		var headings = {};
		console.log($('thead tr', 'gamesTable'));
		$('thead tr', gamesTable).first().find('th').each((i,e) => {
			headings[e.innerText.trim()] = i;
		});
		console.log(headings);
		
		$('tbody tr', gamesTable).each((i,e) => {
			var cells = $('td', e);
			var stats = {};
			
			stats.name     = cells.eq(headings['Game'])          .text().trim();
			stats.playtime = cells.eq(headings['Total Playtime']).text().trim();
			stats.type     = cells.eq(headings['Type'])          .text().trim();
			stats.last     = cells.eq(headings['Last Unlock'])   .text().trim();
			stats.playtime = cells.eq(headings['Total Playtime']).text().trim();
			
			[stats.achDone, stats.achTotal] = cells.eq(headings['Achievements'])
				.text().split('/');
			
			var row = $('<tr></tr>').appendTo(outputTable);
			
			$('<td></td>').appendTo(row).text(stats.name);
			$('<td></td>').appendTo(row).text(stats.type);
			$('<td></td>').appendTo(row).text(stats.last);
			$('<td></td>').appendTo(row).text(stats.achDone);
			$('<td></td>').appendTo(row).text(stats.achTotal);
			
			if (stats.playtime) {
				console.log(stats.playtime);
				var hrs  = (stats.playtime.match(/(?:(\d+)h)/) || [,'0'])[1];
				var mins = (stats.playtime.match(/(?:(\d+)m)/) || [,'00'])[1];
				mins = ('00' + mins).substr(-2);
				$('<td></td>').appendTo(row).text(hrs + ':' + mins + ':00');
			} else {
				$('<td></td>').appendTo(row).text('');
			}
			
		});
		
		page++;
		if (page > maxPage) return;
		
		download();
																
	}
	
});
})(jQuery);
