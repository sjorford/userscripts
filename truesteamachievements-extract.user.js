// ==UserScript==
// @name           TrueSteamAchievements extract
// @namespace      sjorford@gmail.com
// @version        2022.07.13.0
// @author         Stuart Orford
// @match          https://truesteamachievements.com/gamer/sjorford/gamecollection
// @require        https://cdn.jsdelivr.net/npm/luxon@3.0.1/build/global/luxon.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// @grant          none
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		
	</style>`).appendTo('head');
	
	var today = luxon.DateTime.now().toLocaleString(luxon.DateTime.DATE_MED);
	var table = $('<table class="sjo-table"></table>').appendTo('#oGameCollectionHolder').click(() => table.selectRange());
	var gamesFound = [];
	
	window.setInterval(extract, 250);
	
	function extract() {
		
		$('#oGameCollectionHolder td.smallgame').closest('tr').each((i,e) => {
			
			var id = $('[id^="tdPlatform_"]', e).attr('id').match(/_(\d+)/)[1];
			if (gamesFound.indexOf(id) >= 0) return;
			gamesFound.push(id);
			
			var row = $('<tr></tr>').appendTo(table);
			$('<td></td>').appendTo(row).text($('.smallgame', e).text().trim());
			
			var scores = $('.score', e).toArray().map(e => e.innerText.split('/'));
			$('<td></td>').appendTo(row).text(scores[0][0]);
			$('<td></td>').appendTo(row).text(scores[0][1]);
			$('<td></td>').appendTo(row).text(scores[1][0]);
			$('<td></td>').appendTo(row).text(scores[1][1]);
			
			var dates = $('.date', e).toArray().map(e => e.innerText.trim());
			
			var time = dates[0].match(/(?:(\d+) hrs?)? ?(?:(\d+) mins?)?/);
			var hrs  = time[1] || '00';
			var mins = ('00' + (time[2] || '00')).substr(-2);
			$('<td></td>').appendTo(row).text(dates[0] === '' ? '' : (hrs + ':' + mins + ':00'));
			
			$('<td></td>').appendTo(row).text(dates[1] === 'Today' ? today : dates[1]);
			$('<td></td>').appendTo(row).text(dates[2] === 'Today' ? today : dates[2]);
			$('<td></td>').appendTo(row).text(dates[3] === 'Today' ? today : dates[3]);
			
		});
																
	}
	
});
})(jQuery);
