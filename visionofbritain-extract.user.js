// ==UserScript==
// @name           Vision of Britain extract
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.08.06.0
// @match          http://www.visionofbritain.org.uk/unit/*
// @match          http://www.visionofbritain.org.uk/unit/*#*
// @grant          none
// @require        https://code.jquery.com/jquery-3.2.1.min.js
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

$(function() {
	
	var shortBits = 'and'.toUpperCase().split('/');
	
	var table = $('<table class="sjo-table"></table>').prependTo('.lastCol')
					.click(e => {
						if (e.target.tagName != 'A') table.selectRange();
					});
	
	var thisUnit = $('.unit a').text().match(/(.*) (.*)/);
	var thisUnitID = window.location.href.match(/\/unit\/(\d+)/)[1];
	
	if (thisUnit[2] == 'AdmC') {
		
		// Administrative county - extract list of lower-level units

		$('h4').filter((i,e) => e.innerHTML.trim() == 'Lower level units')
			.nextAll('table').first().find('tr:has("td")').each((i,e) => {

			var cells = $(e).find('td');
			
			var unitLink = cells.eq(0).find('a');
			var unit = unitLink.text().replace(/\s+/g, ' ').match(/(.*) (.*)/);
			console.log(unit);
			var unitID = unitLink.attr('href').match(/\/unit\/(\d+)/)[1];
			var type = cells.eq(1).text().trim();
			var startYear = cells.eq(2).text();
			var endYear = cells.eq(3).text();
			
			if (type == 'Local Government District') {

				$('<tr></tr>')
					.addCell(thisUnit[1])
					.addCell(thisUnit[2])
					.addCell(thisUnitID)
					.addCellHTML(`<a href="${unitLink.attr('href').replace(/#.*/, '')}">${cleanPlacename(unit[1])}</a>`)
					.addCell(unit[2])
					.addCell(unitID)
					.addCell(startYear)
					.addCell(endYear)
					.appendTo(table);

			}
			
		});

	} else {
		
		// Extract list of boundary changes

		$('h4').filter((i,e) => e.innerHTML.trim() == 'Boundary changes')
			.nextAll('table').first().find('tr:has("td")').each((i,e) => {

			var cells = $(e).find('td');

			var date = cells.eq(0).text();
			var typeOfChange = cells.eq(1).text();

			var otherUnitLink = cells.eq(2).find('a');
			var otherUnit = otherUnitLink.text().trim().match(/^(.+) (.+)$/);
			var otherUnitID = otherUnitLink.attr('href').match(/\/unit\/(\d+)/)[1];

			var areaText = cells.eq(3).text().replace(/\s+/g, ' ').trim();
			var area = (areaText.match(/Area: (\d+) acres/) || [,])[1];
			var population = (areaText.match(/Population in \d{4}: (\d+)/) || [,])[1];

			$('<tr></tr>')
				.addCell(date)
				.addCell(thisUnit[1])
				.addCell(thisUnit[2])
				.addCell(thisUnitID)
				.addCell(typeOfChange)
				.addCellHTML(`<a href="${otherUnitLink.attr('href').replace(/#.*/, '')}">${cleanPlacename(otherUnit[1])}</a>`)
				.addCell(otherUnit[2])
				.addCell(otherUnitID)
				.addCell(area)
				.addCell(population)
				.appendTo(table);

		});

		
	}
	
	
	function cleanPlacename(text) {
		return text.replace(/\w+/g, str => shortBits.indexOf(str) >= 0 ? str.toLowerCase() : str[0] + str.substr(1).toLowerCase());
	}
	
});
