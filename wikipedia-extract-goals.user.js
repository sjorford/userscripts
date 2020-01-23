// ==UserScript==
// @name         Wikipedia extract goals
// @namespace    sjorford@gmail.com
// @version      2020.01.23.0
// @author       Stuart Orford
// @match        https://en.wikipedia.org/wiki/2019%E2%80%9320_Liverpool_F.C._season
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js
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
		overflow-y: scroll;
		border-top: 1px solid black;
	}
	</style>`).appendTo('head');
	
	var table = $('<table class="sjo-table"></table>')
		.appendTo('body').wrap('<div class="sjo-wrapper"></div>')
		.click(event => table.selectRange());
	
	$('img[alt="Goal"]').each((i,e) => {
		
		var img = $(e);
		var cell = img.closest('td');
		var matchCells = cell.closest('tr').prev('tr').find('td');
		
		var team = matchCells.eq(cell[0].cellIndex).text();
		
		var date = matchCells.eq(0).find('.dtstart').text();
		if (!date) date = matchCells.eq(0).find('span').first().text();
		date = moment(date).format('D MMM YYYY');
		
		var competition = img.closest('div.vevent').prevAll('h3, h2').first().find('.mw-headline').text();
		//matchCells.eq(0).find('small').text();
		
		var name = img.prevUntil('br', 'a').attr('title').replace(/\(.*\)/, '').trim();
		var times = img.nextUntil('br', 'small');
		
		times.each((i,e) => {
			
			var time, og, pen;
			[,time,,,og,pen] = $(e).text().match(/(\d+)'(\s+\(((o.g.)|(pen.))\))?/);
			
			var row = $('<tr></tr>').appendTo(table);
			$('<td></td>').text(date).appendTo(row);
			$('<td></td>').text(competition).appendTo(row);
			$('<td></td>').text(team).appendTo(row);
			$('<td></td>').text(name).appendTo(row);
			$('<td></td>').text(time).appendTo(row);
			$('<td></td>').text(og).appendTo(row);
			$('<td></td>').text(pen).appendTo(row);
			
		});
		
	});
	
});
