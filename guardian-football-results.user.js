﻿// ==UserScript==
// @name         Guardian football results
// @namespace    sjorford@gmail.com
// @version      2019.12.07.0
// @author       Stuart Orford
// @match        https://www.theguardian.com/football/results
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

$(function() {
	
	$(`<style>
	.sjo-wrapper {
		position: fixed;
		width: 100%;
		height: 200px;
		bottom: 0px;
		left: 0px;
		background-color: white;
		font-size: 9pt;
		z-index: 9999;
	}
	</style>`).appendTo('head');
	
	var table = $('<table class="sjo-table"></table>')
		.appendTo('body').wrap('<div class="sjo-wrapper"></div>')
		.click(event => table.selectRange());
	
	var timer = window.setInterval(getData, 200);
	window.console.log(timer, 'getData');
	
	function getData() {

		var matches = $('.football-match--result').not('.sjo-done')
		console.log(matches);
		matches.each((i,e) => {

			var competition = $(e).closest('table').find('.football-matches__heading').text();
			var date = $(e).closest('.football-matches__day').find('.date-divider').text().match(/\d.*/)[0];

			var team1 = $('.team-name__long', e).first().text();
			var team2 = $('.team-name__long', e).last().text();
			var score1 = $('.football-team__score', e).first().text();
			var score2 = $('.football-team__score', e).last().text();

			var row = $('<tr></tr>').appendTo(table);
			$('<td></td>').text(date).appendTo(row);
			$('<td></td>').text(competition).appendTo(row);
			$('<td></td>').text(team1).appendTo(row);
			$('<td></td>').text(score1).appendTo(row);
			$('<td></td>').text(score2).appendTo(row);
			$('<td></td>').text(team2).appendTo(row);

		});
		
		matches.addClass('sjo-done');

	}
	
});