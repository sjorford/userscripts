// ==UserScript==
// @name           Fantasy Premier League tweaks
// @namespace      sjorford@gmail.com
// @version        2025.09.27.0
// @author         Stuart Orford
// @match          https://fantasy.premierleague.com/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		body {padding-bottom: 10rem;}
		.sjo-wrapper {
			position: fixed; right: 0px; top: 0px; height: 100%; width: 30em;
			font-size: small; background-color: white; border: 1px solid black;
			overflow: scroll; z-index: 9999999;
		}
        .znn3xb3:nth-of-type(2) {font-weight: bold;}
	</style>`).appendTo('head');
	
	if (window.location.pathname == '/player-list') {
		
		var posMap = {
			'Goalkeepers': 'GK',
			'Defenders':   'DF',
			'Midfielders': 'MF',
			'Forwards':    'FW',
		};
		
		var table = $('<table class="sjo-table"></table>')
				.appendTo('body').wrap('<div class="sjo-wrapper"></div>')
				.click(event => table.selectRange());
		
		var timer = window.setInterval(check, 100);
		
		function check() {
			var rows = $('tr[role="row"]');
			if (rows.length == 0) return;
			window.clearInterval(timer);

			$('tbody > tr[role="row"]').each((i,e) => {
				
				var row = $(e);
				var heading = row.closest('*:has(h3)').children('h3')
				var pos = posMap[heading.text().trim()];
				
				var cells = $(e).children('td');

				var outputRow = $('<tr></tr>').appendTo(table);
				$('<td></td>').appendTo(outputRow).text(cells.eq(0).text().trim());
				$('<td></td>').appendTo(outputRow).text(cells.eq(1).text().trim());
				$('<td></td>').appendTo(outputRow).text(pos);
				$('<td></td>').appendTo(outputRow).text(cells.eq(2).text().trim());
				$('<td></td>').appendTo(outputRow).text(cells.eq(3).text().trim());

			})


			
		}
		
		
	}
	
	
});
})(jQuery);
