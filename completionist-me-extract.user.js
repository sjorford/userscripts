// ==UserScript==
// @name           completionist.me extract
// @namespace      sjorford@gmail.com
// @version        2026.05.21.0
// @author         Stuart Orford
// @match          https://completionist.me/steam/profile/76561198057191932/apps?*
// @grant          none
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
		
		var headings = {};
		$('thead tr', gamesTable).first().find('th').each((i,e) => {
			headings[e.innerText.trim()] = i;
		});
		
		$('tbody tr', gamesTable).each((i,e) => {
			
			var cells = $('td', e);
			var stats = {};
			
			stats.name     = cells.eq(headings['Game'])          .text().trim();
			stats.type     = cells.eq(headings['Type'])          .text().trim();
			stats.last     = cells.eq(headings['Last Unlock'])   .text().trim().substr(0, 10);
			stats.playtime = cells.eq(headings['Total Playtime']).text().trim();
			
			if (stats.name.match(/ Demo$/)) return;
			
			if (stats.playtime) {
				var match = stats.playtime.match(/(?:([\d,]+)h)? *(?:(\d+)m)?/);
				var hours = !match ? '0' : !match[1] ? '0' : match[1].replace(/,/, '');
				var minutes = !match ? '0' : !match[2] ? '0' : match[2];
				stats.playtime = hours + ':' + minutes.padStart(2, '0');
			}
			
			var achText = cells.eq(headings['Achievements']).text().replace(/\s+/g, ' ').trim();
			if (achText) {
				if ($(e).is('.status-completed')) {
					stats.achDone = stats.achTotal = achText.match(/^\d+$/)[0];
				} else {
					[, stats.achDone, stats.achTotal] = achText.match(/^(?:(\d+) \/ )?(\d+)$/);
					if (!stats.achDone) stats.achDone = 0;
				}
			}
			
			var row = $('<tr></tr>').appendTo(outputTable);
			
			$('<td></td>').appendTo(row).text(stats.name);
			//$('<td></td>').appendTo(row).text(stats.type);
			$('<td></td>').appendTo(row).text(stats.last);
			$('<td></td>').appendTo(row).text(stats.achDone);
			$('<td></td>').appendTo(row).text(stats.achTotal);
			$('<td></td>').appendTo(row).text(stats.playtime);
			
		});
		
		page++;
		if (page > maxPage) return;
		
		download();
		
	}
	
});
})(jQuery);
