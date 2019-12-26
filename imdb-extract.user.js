// ==UserScript==
// @name         IMDb extract
// @namespace    sjorford@gmail.com
// @version      2019.12.26.1
// @author       Stuart Orford
// @match        https://www.imdb.com/name/*
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
	
	var wrapper = $('<div class="sjo-wrapper"></div>').appendTo('body').hide();
	var table = $('<table class="sjo-table"></table>').appendTo(wrapper)
		.click(event => table.selectRange());
	
	var name = $('h1.header .itemprop').text();
	var nameID = location.pathname.match(/\/name\/(nm\d+)/)[1];
	
	$('.filmo-row').filter('[id^="actor-"], [id^="actress-"]').not(':has(.in_production)').each((i,e) => {
		
		var filmoRow = $(e);
		
		filmoRow.contents().each((i,node) => {
			if (node.nodeType == Node.TEXT_NODE) {}
		});
		
		var year = filmoRow.find('.year_column').text().trim().replace(/\/.*/, '');
		var title = filmoRow.find('b').first().text().trim();
		var titleID = filmoRow.find('b a').first().attr('href').match(/\/title\/(tt\d+)/)[1];
		var numEpisodes = filmoRow.find('.filmo-episodes').length;
		
		var titleType, character;
		var childNodes = filmoRow.contents();
		
		var titleIndex = childNodes.toArray().indexOf(filmoRow.find('b')[0]);
		titleType = childNodes[titleIndex + 1].textContent.trim();
		
		var br = filmoRow.find('br')[0];
		if (br) {
			var brIndex = childNodes.toArray().indexOf(br);
			if (childNodes[brIndex + 1].nodeType == Node.TEXT_NODE) {
				character = childNodes[brIndex + 1].textContent.trim();
			}
		}
		
		var row = $('<tr></tr>').appendTo(table);
		$('<td></td>').text(nameID).appendTo(row);
		$('<td></td>').text(name).appendTo(row);
		$('<td></td>').text(titleID).appendTo(row);
		$('<td></td>').text(title).appendTo(row);
		$('<td></td>').text(character).appendTo(row);
		$('<td></td>').text(year).appendTo(row);
		$('<td></td>').text(titleType).appendTo(row);
		$('<td></td>').text(numEpisodes ? numEpisodes : '').appendTo(row);
		
	});
	
	wrapper.show();
	
});
