// ==UserScript==
// @name           Sporcle tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2020.03.06.4
// @match          https://www.sporcle.com/games/*
// @grant          none
// ==/UserScript==

jQuery(function() {
	
	var $ = jQuery;
	
	var games = {
		'/aheig82/top-5-medal-winning-countries-in-each-summer-olympics': {
			moreColumns: true,
		},
		'/boris1700/summer-olympics-silver-medal-countries': {
			enabled: false,
			moreColumns: true,
		},
		'/PumpkinBomb/summerolympics': {
			moreColumns: true,
		},
		'/ateweston85/european-cup--champions-league-semi-finalists': {
			moreColumns: true, 
			styles: `td.d_value {color: black; background-color: white; border-bottom: 1px solid black;}`
		},
		'/g/originalunmembers': {
			unshuffleAnswers: true
		},
		'/darinh/us-100k-cities-within-100miles-5-min-blitz': {
			enabled: false,
			fn: autofill,
			args: [[
				"Abilene", "Albuquerque", "Amarillo", "Anchorage", "Billings", "Boise", "Cedar Rapids", "Corpus Christi", "Des Moines", "El Paso", "Fargo", "Green Bay", "Honolulu", 
				"Jackson", "Laredo", "Little Rock", "Lubbock", "Memphis", "Midland", "Mobile", "Shreveport", "Sioux Falls", "Spokane", "Tallahassee", "Tulsa", "Wichita",
				"Columbia", "Springfield", "Rochester", "Aurora", "Madison", "Akron", "Cleveland", "South Bend", "Flint", "Richmond", "Philadelphia", 
				"Reno", "Visalia", "Los Angeles", "San Diego", "Jacksonville", "Baton Rouge", "Houston", "Oklahoma City", "Kansas City", "Omaha", "Salt Lake City", 
				"Chandler", "Las Vegas", "Salem", "Seattle", "Brownsville", "Austin", "Denton", "Tampa", "Port St. Lucie", "Miami", "Savannah", "Fayetteville", "Winston-Salem", 
				"Cincinnati", "Clarksville", "Chattanooga", "Atlanta", "Birmingham", 
			]]
		},
	};
	
	$.each(games, (key, options) => {
		if (window.location.href.indexOf(key) >= 0) {
			console.log(key, options);
			if (!options.enabled) return;
			
			if (options.moreColumns) moreColumns();
			if (options.unshuffleAnswers) unshuffleAnswers();
			
			if (options.styles) $(`<style>${options.styles}</style>`).appendTo('head');
			
			if (typeof options.fn == 'function') {
				options.fn.apply(null, options.args);
			} else if (Array.isArray(options.fn)) {
				$.each(options.fn, (i,f) => f.call());
			}
			
		}
	});
	
	// Widen the play area and double the number of columns
	function moreColumns() {
		$(`<style>#page-wrapper {width: auto;}</style>`).appendTo('head');
		$('#gameTable > tbody > tr:nth-of-type(2n)').each((index, element) => $(element).prev('tr').append(element.cells));
	}
	
	function unshuffleAnswers() {
		
		var cells = $('.data tr:not(:has(th))');
		var columns = $('.data');
		var columnLengths = columns.toArray().map(e => $(e).find('tr:not(:has(th))').length);
		//console.log(columnLengths);
		
		var timer = window.setInterval(_unshuffleAnswers, 50);
		//window.setTimeout(_unshuffleAnswers, 100);
		console.log('unshuffleAnswers', timer);
		
		function _unshuffleAnswers() {
			if (!$('body').is('.active')) return;
			
			var unsortedCells = cells.filter((i, e) => {
				var thisCell = $(e);
				var index = cells.index(thisCell);
				if (index == 0 || thisCell.text().trim() == '') return false;
				var prevCell = cells.eq(index - 1);
				return (prevCell.text().trim() == '' || prevCell.text().trim() > thisCell.text().trim());
			});
			//console.log('unsortedCells', unsortedCells);
			
			if (unsortedCells.length > 0) {
				
				var sortedCellsArray = cells.toArray().sort((a, b) => {
					if (a.innerText.trim() == b.innerText.trim()) return 0;
					if (a.innerText.trim() == '') return 1;
					if (b.innerText.trim() == '') return -1;
					return (a.innerText.trim() > b.innerText.trim() ? 1 : -1);
				});
				//console.log('sortedCellsArray', sortedCellsArray);
				
				var start = 0, end;
				for (var i = 0; i < columns.length; i++) {
					end = start + columnLengths[i];
					columns.eq(i).append(sortedCellsArray.slice(start, end));
					start = end;
				}
				
			}
			
		}
	}
	
	$(`<style>
		#bg-temp.shifted {margin-top: auto;}
		#leaderboard-wrapper {display: none;}
		.sjo-hint {color: #bbb;}
	</style>`).appendTo('head');
	
	var hints = {
		'ultimate_usmetro':
			['NY-NJ-PA', 'CA', 'IL-IN-WI', 'TX', 'TX', 'PA-NJ-DE-MD', 'DC-VA-MD-WV', 'FL', 'GA', 'MA-NH', 'CA', 'CA', 'MI', 'AZ', 'WA', 'MN-WI', 'CA', 'FL', 'MO-IL', 'MD', 'CO', 'PA', 'OR-WA', 'TX', 'CA', 'FL', 'OH-KY-IN', 'OH', 'MO-KS', 'NV', 'CA', 'OH', 'NC-SC', 'TX', 'IN', 'VA-NC', 'TN', 'RI-MA', 'WI', 'FL', 'TN-MS-AR', 'KY-IN', 'OK', 'VA', 'CT', 'LA', 'NC', 'UT', 'NY', 'AL', 'NY', 'AZ', 'HI', 'OK', 'CA', 'CT', 'NM', 'NE-IA', 'NY', 'CT', 'CA', 'OH', 'CA', 'PA-NJ', 'TX', 'LA', 'MA', 'TX', 'MI', 'SC', 'NC', 'AR', 'FL', 'TN', 'OH', 'CA', 'MA', 'SC', 'NY', 'NY', 'CO', 'OH', 'SC', 'FL', 'ID', 'KS', 'FL', 'IA', 'WI', 'PA', 'OH-PA', 'GA-SC', 'UT', 'PA', 'MS', 'FL', 'UT', 'TN-GA', 'PA', 'CA', 'ME', 'NC', 'FL', 'CA', 'NC', 'KY', 'AR-MO', 'WA', 'MI', 'FL', 'CA', 'MO', 'PA', 'TX', 'NV', 'NC', 'FL', 'CA', 'AL', 'MI', 'CA', 'IN', 'CA', 'TX', 'PA', 'AL', 'TX', 'OH', 'LA', 'NH', 'OR', 'TX', 'AK', 'IA-IL', 'IL', 'AL', 'NC', 'FL', 'NC', 'NJ', 'NC', 'IN-KY', 'GA', 'OR', 'IL', 'MI', 'FL', 'MI', 'FL', 'IN-MI', 'TN-VA', 'WI', 'VA', 'NE', 'CO', 'WV', 'GA-AL', 'AR-OK', 'CO', 'NY', 'TX', 'WV-KY-OH', 'SC', 'PA', 'MN-WI', 'TN-KY', 'LA', 'SC', 'NJ', 'CT', 'CA', 'MD-WV', 'FL', 'MI', 'CA', 'WA', 'IA', 'CA', 'CO', 'WA', 'TX', 'WA', 'VA', 'TX', 'MS', 'NY', 'WA', 'TX', 'KS', 'GA', 'SD', 'IL', 'TX', 'WI', 'AL', 'CA', 'TX', 'MA', 'NM', 'TX'],
		'us_cities_official_2010_population':
			['NY', 'CA', 'IL', 'TX', 'PA', 'AZ', 'TX', 'CA', 'TX', 'CA', 'FL', 'IN', 'CA', 'TX', 'OH', 'TX', 'NC', 'MI', 'TX', 'TN', 'MD', 'MA', 'WA', 'DC', 'TN', 'CO', 'KY', 'WI', 'OR', 'NV', 'OK', 'NM', 'AZ', 'CA', 'CA', 'CA', 'MO', 'AZ', 'VA', 'GA', 'CO', 'NE', 'NC', 'FL', 'OH', 'OK', 'CA', 'HI', 'MN', 'KS', 'TX', 'CA', 'LA', 'CA', 'FL', 'CO', 'CA', 'MO', 'PA', 'TX', 'CA', 'OH', 'KY', 'AK', 'CA', 'OH', 'MN', 'NJ', 'NC', 'NY', 'TX', 'NE', 'NV', 'IN', 'NJ', 'FL', 'CA', 'VA', 'FL', 'AZ', 'TX', 'WI', 'NC', 'TX', 'LA', 'NC', 'TX', 'AZ', 'NV', 'FL', 'VA', 'AZ', 'NV', 'TX', 'CA', 'CA', 'AL', 'NY', 'CA', 'WA', 'AZ', 'VA', 'AL', 'ID', 'VA', 'IA', 'CA', 'NC', 'LA', 'OH', 'WA', 'IL', 'CA', 'CA', 'NY', 'GA', 'AL', 'AR', 'CA', 'CA', 'TX', 'CA', 'GA', 'MI', 'UT', 'FL', 'MA', 'VA', 'AL', 'TN', 'RI', 'CA', 'TX', 'TX', 'MS', 'KS', 'CA', 'CA', 'TN', 'CA', 'FL', 'CA', 'FL', 'CA', 'WA', 'AZ', 'MO', 'CA', 'OR', 'FL', 'OR', 'FL', 'AZ', 'SD', 'MA', 'CA', 'IL', 'CA', 'CA', 'CA', 'CA', 'TX', 'IL', 'NJ', 'KS', 'CA', 'NY', 'CT', 'CA', 'CO', 'CA', 'CO', 'IL', 'OH', 'FL', 'CA', 'VA', 'TX', 'VA', 'CA', 'CA', 'GA', 'NC', 'CA', 'MI', 'TN', 'TX', 'TX', 'CT', 'MI', 'UT', 'SC', 'TX', 'KS', 'CA', 'IA', 'KS', 'NJ', 'TX', 'CT'],
		'100_us_cities':
			['NY', 'CA', 'IL', 'TX', 'PA', 'AZ', 'TX', 'CA', 'TX', 'CA', 'TX', 'FL', 'CA', 'IN', 'OH', 'TX', 'NC', 'WA', 'CO', 'TX', 'MI', 'DC', 'MA', 'TN', 'TN', 'OR', 'OK', 'NV', 'MD', 'KY', 'WI', 'NM', 'AZ', 'CA', 'CA', 'MO', 'CA', 'AZ', 'GA', 'CO', 'VA', 'NC', 'NE', 'FL', 'CA', 'MN', 'OK', 'KS', 'LA', 'TX', 'OH', 'CA', 'FL', 'CO', 'HI', 'CA', 'CA', 'TX', 'CA', 'MO', 'KY', 'CA', 'PA', 'MN', 'AK', 'OH', 'NV', 'NC', 'TX', 'NJ', 'OH', 'NE', 'FL', 'CA', 'NJ', 'AZ', 'IN', 'NY', 'NC', 'FL', 'CA', 'TX', 'TX', 'WI', 'AZ', 'VA', 'NV', 'NC', 'AZ', 'FL', 'TX', 'AZ', 'TX', 'VA', 'NV', 'CA', 'LA', 'VA', 'ID', 'CA'],
		'us_cities_by_peak_rank':
			['NY', 'CA', 'IL', 'PA', 'MD', 'MA', 'LA', 'NY', 'TX', 'MI', 'MO', 'SC', 'OH', 'AZ', 'CA', 'OH', 'PA', 'TX', 'TX', 'MA', 'PA', 'CA', 'PA', 'NY', 'RI', 'DC', 'RI', 'NY', 'PA', 'CA', 'VA', 'MA', 'FL', 'IN', 'WI', 'NJ', 'KY', 'VA', 'MA', 'MA', 'PA', 'TX', 'TN', 'NH', 'MA', 'OH', 'MN', 'ME', 'TX', 'MA', 'NC', 'VA', 'CT', 'NY', 'NY', 'GA', 'MA', 'TX', 'WA', 'MO', 'NY', 'DC', 'CT', 'NE', 'VA', 'CO', 'MN', 'CT', 'PA', 'NY', 'OR', 'GA', 'MA', 'NY'],
	};
	
	var gameKey = window.location.href.split('/').slice(-1)[0].replace(/-/g, '_');
	console.log(gameKey);
	if (hints[gameKey]) {
		console.log(hints[gameKey]);
		$('.d_value').each((index, element) => $(`<span class="sjo-hint">${hints[gameKey][index]}</span>`).appendTo(element));
	}
	
	$('body').on('keypress', '#gameinput', event => {
		if (event.originalEvent.key === 'ArrowDown' ? $('#nextButton').click() : event.originalEvent.key === 'ArrowUp' ? $('#previousButton').click() : '');
	});
	
	// Click headers to sort
	$('.data th').click(event => {
		
		var tables = $('.data');
		var rows = tables.find('tr:has(td:visible)').not(':has(th)');
		var numRows = tables.toArray().map(t => t.rows.length - 1);
		
		var header = $(event.target);
		var col = header.prop('cellIndex');
		var order = header.hasClass('sjo-ascending') ? -1 : 1;
		tables.find(`tr:first-of-type th:nth-of-type(${col+1})`).toggleClass('sjo-ascending', order == 1);
		
		console.log(col, order, numRows, rows);
		
		var sortedRows = rows.toArray().sort((a,b) => (a.cells[col].innerText > b.cells[col].innerText) ? order : (a.cells[col].innerText < b.cells[col].innerText) ? -order : 0);
		tables.each((i,e) => $(e).append(sortedRows.splice(0, numRows[i])));
		
	});
	
	// Double-click to retry value
	$('.d_value').dblclick(event => {
		console.log(event);
		var value = event.target.innerText.trim();
		if (value != '') {
			var gameinput = $('#gameinput').focus().val(value).trigger($.Event("input"));
		}
	});
	
	function autofill(answers) {
		var gameinput = $('#gameinput');
		var index = 0;
		var timer = window.setInterval(_autofill, 50);
		
		function _autofill() {
			if (!$('body').is('.active')) return;
			if (index >= answers.length) return window.clearInterval(timer);
			gameinput.val(answers[index++]).trigger($.Event("input"));
		}
		
	}
	
});
