// ==UserScript==
// @name         Cricinfo extract commentary
// @namespace    sjorford@gmail.com
// @version      2019.08.26.1
// @author       Stuart Orford
// @match        https://www.espncricinfo.com/*
// @grant        none
// @require      https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

$(function() {

	if ($('.match-commentary').length == 0) return;
	
	$(`<style>
		#sjo-extract-box {
			position: fixed: bottom: 0; width: 100%; height: 100px; overflow: scroll;
			background-color: white; border: 1px solid black;}
		#sjo-extract-box table {position: static;}
		#sjo-extract-box td {height: auto; text-align: left; font-size: 9px;}
	</style>`).appendTo('head');
	
	var box = $('<div id="sjo-extract-box"></div>').appendTo('body').click(() => box.selectRange());
	var dataLength = 0;
	
	var timer = window.setInterval(extractCommentary, 200);
	console.log('Cricinfo extract commentary', timer);
	
	function extractCommentary() {
		
		var data = [];
		var items = $('.commentary-item .item-wrapper');
		if (items.length == dataLength) return;
		dataLength = items.length
		
		items.each((index, element) => {
			
			var item = $(element);
			var textMatch = item.find('.description').text().match(/^(.*?) to (.*?), .*$/);
			var runsMatch = item.find('.over-score').text().match(/(\d*)([a-z]*)(W?)/);
			
			data.push({
				ball: item.find('.time-stamp').text() - 0,
				runsAll: runsMatch[0],
				runs: runsMatch[1],
				extras: runsMatch[2],
				wicket: runsMatch[3],
				bowler: (textMatch && textMatch[1]) || '',
				batsman: (textMatch && textMatch[2]) || '',
				text: textMatch[0],
			});
		});
		
		if (data[0].ball > data[data.length - 1].ball) data.reverse();
		
		box.empty();
		var table = $('<table></table>').appendTo(box);
		$.each(data, (i, e) => {
			var row = $('<tr></tr>').appendTo(table);
			$('<td></td>').text(i + 1).appendTo(row);
			$('<td></td>').text(e.ball).appendTo(row);
			$('<td></td>').text(e.bowler).appendTo(row);
			$('<td></td>').text(e.batsman).appendTo(row);
			$('<td></td>').text(e.runsAll).appendTo(row);
			$('<td></td>').text(e.runs).appendTo(row);
			$('<td></td>').text(e.extras).appendTo(row);
			$('<td></td>').text(e.wicket).appendTo(row);
			$('<td></td>').text(e.text).appendTo(row);
		});
		
	}
	
});
