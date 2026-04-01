// ==UserScript==
// @name           Cricinfo extract archive
// @namespace      sjorford@gmail.com
// @version        2026.04.01.2
// @author         Stuart Orford
// @match          https://www.espncricinfo.com/ci/engine/series/index.html?season=*;view=season
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	var debug = false;
	
	$(`<style>
			.sjo-wrapper {
				position: fixed; left: 0px; bottom: 0px; width: 100%; height: 20em;
				font-size: small; background-color: white; border: 1px solid black;
				overflow: scroll; z-index: 9999999;
			}
			.sjo-table td {padding: 0.2em;}
	</style>`).appendTo('head');
	
	var wrapper = $('<div class="sjo-wrapper"></div>').appendTo('body');
	var table = $('<table class="sjo-table"></table>').appendTo(wrapper)
					.click(event => table.selectRange());

	var timer = window.setInterval(scrape, 500);
	
	function scrape() {
		
		var blocks = $('.default-match-block').not('.sjo-done');
		if (blocks.length == 0) return;
		
		if (debug) window.clearInterval(timer);
		
		blocks.addClass('sjo-done');
		
		blocks.each((i,e) => {
			if (debug) console.log(i,e);
			
			var season  = $('.active .year').text().trim();
			var series  = $(e).closest('.series-summary-block').find('.teams').text().trim();
			var countryMatch = $(e).closest('.series-summary-block').find('.date-location').text().match(/\(in (.+)\)/);
			var country = countryMatch ? countryMatch[1] : '';
			if (debug) console.log(season, series, country);
			
			var [, seriesID, matchID] = $('.match-articles a', e).first().attr('href').match(/\/series\/(\d+)\/scorecard\/(\d+)/);
			if (debug) console.log(seriesID, matchID);
			
			var date = $('.match-info > .bold', e).text();
			var [, group, venue, daynight] = $('.match-no', e).text().trim().match(/^(?:(.+) )?at (.+?)(?: \((day\/night)\))?$/);
			daynight = daynight ? 'D/N' : '';
			if (debug) console.log(group, venue, daynight);
			
			var team1  = $('.innings-info-1', e).contents().eq(0).text();
			var score1 = $('.innings-info-1 > .bold', e).text();
			var team2  = $('.innings-info-2', e).contents().eq(0).text();
			var score2 = $('.innings-info-2 > .bold', e).text();
			var result = $('.match-status', e).text().trim();
			
			var outputRow = $('<tr></tr>').appendTo(table);
			$('<td></td>').appendTo(outputRow).text(season);
			$('<td></td>').appendTo(outputRow).text(country);
			$('<td></td>').appendTo(outputRow).text(seriesID);
			$('<td></td>').appendTo(outputRow).text(series);
			$('<td></td>').appendTo(outputRow).text(matchID);
			$('<td></td>').appendTo(outputRow).text(date);
			$('<td></td>').appendTo(outputRow).text(group);
			$('<td></td>').appendTo(outputRow).text(venue);
			$('<td></td>').appendTo(outputRow).text(daynight);
			$('<td></td>').appendTo(outputRow).text(team1);
			$('<td></td>').appendTo(outputRow).text(score1);
			$('<td></td>').appendTo(outputRow).text(team2);
			$('<td></td>').appendTo(outputRow).text(score2);
			$('<td></td>').appendTo(outputRow).text(result);
			
		});
		
		wrapper.prop('scrollTop', wrapper.prop('scrollHeight'));
		
	}
	
});
})(jQuery);
