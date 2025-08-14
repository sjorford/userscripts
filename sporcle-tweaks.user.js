// ==UserScript==
// @name           Sporcle tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2025.08.14.0
// @match          https://www.sporcle.com/games/*
// @grant          none
// ==/UserScript==

jQuery(function() {
	var $ = jQuery;
	
	$(`<style>
		#bg-temp.shifted {margin-top: auto;}
		#leaderboard-wrapper, #right-rail {display: none !important;}
		#gameTable .gametable-col td {text-align: left;}
		.sjo-hint {color: #bbb;}
		#quiz-container #quiz-area {width: auto;}
	</style>`).appendTo('head');
	
	$('.mainNav:has(:contains("Live Trivia")) .dropdown').remove();
	
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
		'/Bumble/worldcupteams': {
			styles: `
			th.h_name,  td.d_name  {width: 15%;} 
			th.h_value, td.d_value {width: 55%;} 
			th.h_extra, td.d_extra {width: 30%;}`
		},
		'/ateweston85/european-cup--champions-league-semi-finalists': {
			moreColumns: true, 
			styles: `td.d_value {color: black; background-color: white; border-bottom: 1px solid black;}`
		},
		'/g/originalunmembers': {
			unRandomize: true,
		},
		'darinh/us-100k-cities-within-100miles-5-min-blitz': {
			hints: ['TX*', 'OH', 'NM*', 'VA', 'PA', 'TX*', 'AK*', 'MI', 'CA', 'TX', 'CO', 'GA', 'GA', 'GA', 'CO', 'IL', 'TX', 'CA', 'MD', 'LA', 'TX', 'WA', 'CA', 'MT*', 'AL', 'ID*', 'MA', 'CT', 'TX', 'NY', 'MA', 'FL', 'CA', 'TX', 'NC', 'IA*', 'CO', 'AZ', 'SC', 'NC', 'TN', 'VA', 'IL', 'CA', 'OH', 'TN', 'FL', 'OH', 'CO', 'MO*', 'SC', 'GA', 'OH', 'CA', 'FL', 'CA', 'TX*', 'TX', 'CA', 'OH', 'TX', 'CO', 'IA*', 'MI', 'NC', 'TX*', 'IL', 'NJ', 'CA', 'PA', 'CA', 'OR', 'IN', 'WA', 'CA', 'ND*', 'NC', 'MI', 'CA', 'CO', 'FL', 'IN', 'TX', 'CA', 'CA', 'TX', 'FL', 'TX', 'AZ', 'AZ', 'TX', 'MI', 'WI*', 'NC', 'OR', 'VA', 'CT', 'CA', 'NV', 'FL', 'NC', 'FL', 'HI*', 'TX', 'AL', 'MO', 'IN', 'TX', 'MS*', 'FL', 'NJ', 'IL', 'KS', 'MO', 'TX', 'TN', 'LA', 'CO', 'MI', 'TX*', 'NV', 'KY', 'NE', 'AR*', 'CA', 'KY', 'MA', 'TX*', 'WI', 'NH', 'TX', 'TX', 'TN*', 'AZ', 'TX', 'FL', 'FL', 'TX*', 'WI', 'MN', 'FL', 'AL*', 'CA', 'AL', 'CA', 'TN', 'CA', 'IL', 'TN', 'CT', 'LA', 'NY', 'NJ', 'VA', 'VA', 'OK', 'NV', 'CA', 'CA', 'OK', 'KS', 'NE', 'FL', 'KS', 'FL', 'TX', 'NJ', 'FL', 'AZ', 'IL', 'PA', 'AZ', 'PA', 'TX', 'FL', 'OR', 'RI', 'UT', 'CO', 'NC', 'NV', 'CA', 'VA', 'CA', 'MN', 'NY', 'IL', 'CA', 'CA', 'OR', 'CA', 'UT', 'TX', 'CA', 'CA', 'CA', 'CA', 'CA', 'CA', 'GA', 'AZ', 'WA', 'LA*', 'SD*', 'IN', 'WA*', 'IL', 'MA', 'MO*', 'MO', 'MN', 'FL', 'CT', 'MI', 'CA', 'CA', 'AZ', 'NY', 'WA', 'FL*', 'FL', 'CA', 'AZ', 'CO', 'OH', 'KS', 'AZ', 'OK*', 'CA', 'WA', 'CA', 'CA', 'VA', 'CA', 'TX', 'MI', 'DC', 'CT', 'UT', 'UT', 'CO', 'TX', 'KS*', 'NC', 'NC', 'MA', 'NY',],
		},
		'/puckett86/state-by-city': {
			unRandomize: true,
		},
		'/puckett86/taking-up-lots-of-space': {
			autofillForcedOrder: true,
		},
		'/mszzz/most-populous-us-cities-': {
			trimAnswers: {
				replace: /^\d+\)\s*|,\s*[A-Z]{2}$/g,
			},
		},
		'/guilherme_4/us-cities-by-n-states': {
			hints: ['NY', 'NC', 'NV', 'NM', 'NE', 'NC', 'NV', 'NJ', 'NC', 'NJ', 'NE', 'NC', 'NY', 'NV', 'NV', 'NC', 'NY', 'NY', 'NC', 'NC', 'NJ', 'NY', 'NJ', 'ND', 'NH', 'NC', 'NC', 'NM', 'NV', 'NJ', 'NC', 'NM'],
		},
		'/Unidentifiedkiwi/ultimate_usmetro': {
			hints: ['NY-NJ-PA', 'CA', 'IL-IN-WI', 'TX', 'TX', 'DC-VA-MD-WV', 'PA-NJ-DE-MD', 'FL', 'GA', 'MA-NH', 'AZ', 'CA', 'CA', 'MI', 'WA', 'MN-WI', 'CA', 'FL', 'CO', 'MD', 'MO-IL', 'FL', 'NC-SC', 'TX', 'OR-WA', 'CA', 'PA', 'TX', 'NV', 'OH-KY-IN', 'MO-KS', 'OH', 'IN', 'OH', 'CA', 'TN', 'VA-NC', 'RI-MA', 'FL', 'WI', 'OK', 'NC', 'TN-MS-AR', 'VA', 'KY-IN', 'LA', 'UT', 'CT', 'NY', 'AL', 'NY', 'MI', 'AZ', 'HI', 'OK', 'CA', 'MA', 'NE-IA', 'CT', 'SC', 'NM', 'CA', 'NY', 'TN', 'TX', 'LA', 'TX', 'CT', 'PA-NJ', 'CA', 'FL', 'SC', 'OH', 'SC', 'CA', 'NC', 'ID', 'FL', 'CO', 'AR', 'FL', 'IA', 'OH', 'MA', 'NY', 'UT', 'WI', 'NC', 'UT', 'FL', 'NY', 'NC', 'KS', 'OH', 'GA-SC', 'FL', 'MS', 'PA', 'WA', 'PA', 'TN-GA', 'PA', 'CA', 'ME', 'AR-MO', 'MI', 'OH-PA', 'NC', 'KY', 'FL', 'AL', 'NV', 'CA', 'SC', 'FL', 'LA', 'MO', 'TX', 'CA', 'NC', 'PA', 'CA', 'CA', 'CA', 'OR', 'AL', 'PA', 'NH', 'TX', 'TX', 'IN', 'MD', 'MS', 'MI', 'GA', 'IL', 'OH', 'AK', 'TX', 'LA', 'NJ', 'AL', 'IA-IL', 'FL', 'OR', 'FL', 'FL', 'MI', 'NC', 'WV-KY-OH', 'CO', 'NE', 'FL', 'IL', 'CO', 'CO', 'GA-AL', 'WI', 'SC', 'IN-MI', 'TX', 'TN-KY', 'VA', 'IN-KY', 'TN-VA', 'WA', 'WA', 'MD-WV', 'NY', 'MN-WI', 'FL', 'TX', 'NC', 'CA', 'CA', 'TX', 'SD', 'IA', 'WA', 'NJ', 'PA', 'CA', 'TX', 'AL', 'CT', 'TX', 'TX', 'MI', 'VA', 'WV', 'WA', 'ND', 'NY', 'AR-OK', 'WI', 'AZ', 'GA', 'TX', 'KS', 'AL', ],
		},
		'us_cities_official_2010_population': {
			hints: ['NY', 'CA', 'IL', 'TX', 'PA', 'AZ', 'TX', 'CA', 'TX', 'CA', 'FL', 'IN', 'CA', 'TX', 'OH', 'TX', 'NC', 'MI', 'TX', 'TN', 'MD', 'MA', 'WA', 'DC', 'TN', 'CO', 'KY', 'WI', 'OR', 'NV', 'OK', 'NM', 'AZ', 'CA', 'CA', 'CA', 'MO', 'AZ', 'VA', 'GA', 'CO', 'NE', 'NC', 'FL', 'OH', 'OK', 'CA', 'HI', 'MN', 'KS', 'TX', 'CA', 'LA', 'CA', 'FL', 'CO', 'CA', 'MO', 'PA', 'TX', 'CA', 'OH', 'KY', 'AK', 'CA', 'OH', 'MN', 'NJ', 'NC', 'NY', 'TX', 'NE', 'NV', 'IN', 'NJ', 'FL', 'CA', 'VA', 'FL', 'AZ', 'TX', 'WI', 'NC', 'TX', 'LA', 'NC', 'TX', 'AZ', 'NV', 'FL', 'VA', 'AZ', 'NV', 'TX', 'CA', 'CA', 'AL', 'NY', 'CA', 'WA', 'AZ', 'VA', 'AL', 'ID', 'VA', 'IA', 'CA', 'NC', 'LA', 'OH', 'WA', 'IL', 'CA', 'CA', 'NY', 'GA', 'AL', 'AR', 'CA', 'CA', 'TX', 'CA', 'GA', 'MI', 'UT', 'FL', 'MA', 'VA', 'AL', 'TN', 'RI', 'CA', 'TX', 'TX', 'MS', 'KS', 'CA', 'CA', 'TN', 'CA', 'FL', 'CA', 'FL', 'CA', 'WA', 'AZ', 'MO', 'CA', 'OR', 'FL', 'OR', 'FL', 'AZ', 'SD', 'MA', 'CA', 'IL', 'CA', 'CA', 'CA', 'CA', 'TX', 'IL', 'NJ', 'KS', 'CA', 'NY', 'CT', 'CA', 'CO', 'CA', 'CO', 'IL', 'OH', 'FL', 'CA', 'VA', 'TX', 'VA', 'CA', 'CA', 'GA', 'NC', 'CA', 'MI', 'TN', 'TX', 'TX', 'CT', 'MI', 'UT', 'SC', 'TX', 'KS', 'CA', 'IA', 'KS', 'NJ', 'TX', 'CT'],
		},
		'/DanW/100_us_cities': { // updated 2025-07-08
			hints: ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'FL', 'TX', 'TX', 'CA', 'OH', 'NC', 'IN', 'CA', 'WA', 'CO', 'OK', 'TN', 'DC', 'TX', 'NV', 'MA', 'MI', 'OR', 'KY', 'TN', 'MD', 'WI', 'NM', 'AZ', 'CA', 'CA', 'AZ', 'GA', 'MO', 'CO', 'NE', 'NC', 'FL', 'VA', 'CA', 'CA', 'MN', 'CA', 'OK', 'FL', 'TX', 'KS', 'CO', 'LA', 'OH', 'HI', 'CA', 'NV', 'FL', 'KY', 'CA', 'CA', 'TX', 'CA', 'OH', 'CA', 'NJ', 'MN', 'PA', 'NC', 'NC', 'NE', 'NJ', 'TX', 'AK', 'NV', 'MO', 'WI', 'AZ', 'AZ', 'NV', 'NY', 'CA', 'IN', 'TX', 'OH', 'FL', 'TX', 'TX', 'VA', 'AZ', 'NC', 'FL', 'AZ', 'TX', 'ID', 'VA', 'WA', 'VA', 'CA', 'AL'],
		},
		'/DanW/100_world_cities': { // updated 2025-07-18
			hints: ['Japan', 'South Korea', 'Mexico', 'India', 'India', 'USA', 'Brazil', 'Philippines', 'USA', 'China', 'Japan', 'India', 'Pakistan', 'China', 'Indonesia', 'Egypt', 'Argentina', 'Russia', 'China', 'Bangladesh', 'Turkey', 'Brazil', 'Iran', 'UK', 'Nigeria', 'France', 'USA', 'China', 'China', 'Peru', 'Thailand', 'Colombia', 'DR Congo', 'Pakistan', 'Japan', 'USA', 'China', 'India', 'India', 'South Africa', 'India', 'USA', 'China', 'Taiwan', 'Iraq', 'China', 'USA', 'Spain', 'USA', 'Chile', 'Brazil', 'India', 'USA', 'USA', 'USA', 'Germany', 'Sudan', 'USA', 'Vietnam', 'Canada', 'China', 'China', 'USA', 'China', 'Saudi Arabia', 'Venezuela', 'Myanmar', 'China', 'India', 'Russia', 'Malaysia', 'China', 'Singapore', 'Mexico', 'Bangladesh', 'Egypt', 'USA', 'Australia', 'Algeria', 'China', 'Ivory Coast', 'Germany', 'Brazil', 'Spain', 'Mexico', 'China', 'India', 'China', 'Morocco', 'USA', 'Turkey', 'Australia', 'Brazil', 'Brazil', 'Greece', 'Canada', 'North Korea', 'South Korea', 'South Africa', 'Brazil',],
			styles: `.d_value.wrong {background-color: pink;}`,
		},
		'us_cities_by_peak_rank': {
			hints: ['NY', 'CA', 'IL', 'PA', 'MD', 'MA', 'LA', 'NY', 'TX', 'MI', 'MO', 'SC', 'OH', 'AZ', 'CA', 'OH', 'PA', 'TX', 'TX', 'MA', 'PA', 'CA', 'PA', 'NY', 'RI', 'DC', 'RI', 'NY', 'PA', 'CA', 'VA', 'MA', 'FL', 'IN', 'WI', 'NJ', 'KY', 'VA', 'MA', 'MA', 'PA', 'TX', 'TN', 'NH', 'MA', 'OH', 'MN', 'ME', 'TX', 'MA', 'NC', 'VA', 'CT', 'NY', 'NY', 'GA', 'MA', 'TX', 'WA', 'MO', 'NY', 'DC', 'CT', 'NE', 'VA', 'CO', 'MN', 'CT', 'PA', 'NY', 'OR', 'GA', 'MA', 'NY'],
		},
		'1mil_europe': {
			hints: ['Russia', 'Turkey', 'UK', 'France', 'Spain', 'Germany', 'Russia', 'Italy', 'Germany', 'Spain', 'Germany', 'Italy', 'Italy', 'Greece', 'Ukraine', 'Germany', 'Netherlands', 'UK', 'UK', 'Germany', 'Hungary', 'Portugal', 'Netherlands', 'Poland', 'Germany', 'Poland', 'Germany', 'Romania', 'Austria', 'Sweden', 'UK', 'Belgium', 'Belarus', 'France', 'UK', 'Russia', 'Spain', 'Italy', 'Ukraine', 'France', 'UK', 'Denmark', 'Germany', 'UK', 'Ukraine', 'UK', 'Russia', 'Russia', 'Serbia', 'Czechia', 'Ukraine', 'Switzerland', 'Ireland', 'UK', 'Bulgaria', 'Russia', 'Spain', 'France', 'Russia', 'Finland', 'Russia', 'Germany', 'Norway', 'Portugal', 'Germany', 'UK', 'Russia', 'Russia', 'Ukraine', 'Russia', 'Russia', 'Belgium', 'France', 'France', 'Spain'],
		},
		'european_cup__champions_league_semi_finalists': {
			hints: ['ESP', 'FRA', 'SCO', 'ITA', 'ESP', 'ITA', 'ENG', 'SRB', 'ESP', 'ITA', 'ENG', 'HUN', 'ESP', 'FRA', 'ESP', 'SUI', 'ESP', 'GER', 'ESP', 'SCO', 'POR', 'ESP', 'GER', 'AUT', 'POR', 'ESP', 'BEL', 'ENG', 'ITA', 'POR', 'SCO', 'NED', 'ITA', 'ESP', 'GER', 'SUI', 'ITA', 'POR', 'ENG', 'HUN', 'ESP', 'SRB', 'ITA', 'ENG', 'SCO', 'ITA', 'CZE', 'BUL', 'ENG', 'POR', 'ITA', 'ESP', 'ITA', 'NED', 'ENG', 'SVK', 'NED', 'SCO', 'ENG', 'POL', 'NED', 'GRE', 'ESP', 'SRB', 'NED', 'ITA', 'POR', 'SCO', 'NED', 'ITA', 'ENG', 'ESP', 'GER', 'ESP', 'SCO', 'HUN', 'GER', 'ENG', 'ESP', 'FRA', 'GER', 'FRA', 'NED', 'ESP', 'ENG', 'GER', 'UKR', 'SUI', 'ENG', 'BEL', 'GER', 'ITA', 'ENG', 'SWE', 'AUT', 'GER', 'ENG', 'GER', 'NED', 'ESP', 'ENG', 'ESP', 'GER', 'ITA', 'ENG', 'GER', 'BEL', 'BUL', 'GER', 'ITA', 'ESP', 'POL', 'ENG', 'ITA', 'ROM', 'SCO', 'ITA', 'ENG', 'FRA', 'GRE', 'ROM', 'ESP', 'BEL', 'SWE', 'POR', 'GER', 'UKR', 'ESP', 'NED', 'POR', 'ESP', 'ROM', 'ITA', 'ROM', 'TUR', 'ESP', 'ITA', 'POR', 'GER', 'FRA', 'SRB', 'FRA', 'GER', 'RUS', 'ESP', 'ITA', 'SRB', 'CZE', 'FRA', 'ITA', 'SWE', 'SCO', 'ITA', 'ESP', 'FRA', 'POR', 'NED', 'ITA', 'GER', 'FRA', 'ITA', 'NED', 'FRA', 'GRE', 'GER', 'ITA', 'NED', 'ENG', 'ESP', 'ITA', 'GER', 'FRA', 'ENG', 'GER', 'UKR', 'ITA', 'ESP', 'ESP', 'ESP', 'GER', 'GER', 'ESP', 'ENG', 'ESP', 'ESP', 'GER', 'ESP', 'ENG', 'ITA', 'ITA', 'ITA', 'ESP', 'POR', 'FRA', 'ENG', 'ESP', 'ENG', 'ITA', 'ENG', 'NED', 'ESP', 'ENG', 'ITA', 'ESP', 'ITA', 'ENG', 'ENG', 'ENG', 'ENG', 'ENG', 'ESP', 'ENG', 'ESP', 'ENG', 'ENG', 'ENG', 'ITA', 'GER', 'ESP', 'FRA', 'ESP', 'ENG', 'ESP', 'GER', 'ENG', 'GER', 'ESP', 'ESP', 'GER', 'GER', 'ESP', 'ESP', 'ESP', 'ESP', 'GER', 'ENG', 'ESP', 'ITA', 'GER', 'ESP', 'ESP', 'ESP', 'ENG', 'GER', 'ESP', 'ITA', 'ESP', 'FRA', 'ESP', 'ENG', 'GER', 'ITA', 'ENG', 'ENG', 'NED', 'ESP',],
		},
		'/Mellowfet/winning-and-losing-major-party-presidential-tickets': {
			autofill: ['Washington', 'Adams', 'Jefferson', 'Madison', 'Monroe', 'Jackson', 'Van Buren', 'Harrison', 'Tyler', 'Polk', 'Taylor', 'Fillmore', 'Pierce', 'Buchanan', 'Lincoln', 'Johnson', 'Grant', 'Hayes', 'Garfield', 'Arthur', 'Cleveland', 'McKinley', 'Roosevelt', 'Taft', 'Wilson', 'Harding', 'Coolidge', 'Hoover', 'Truman', 'Eisenhower', 'Kennedy', 'Nixon', 'Ford', 'Carter', 'Reagan', 'Bush', 'Clinton', 'Obama', 'Trump', 'Biden',],
			fn: () => {
				$(`<style>#quiz-container #quiz-area {width: auto;}</style>`).appendTo('head');
				$('#slot3,#slot7,#slot35,#slot36,#slot40,#slot53,#slot54,#slot70,#slot210,#slot211,#slot284,#slot285, #slot2,#slot6,#slot10').closest('tr').hide();
				$('.d_extra').each((i,e) => {
					var d_extra = $(e);
					d_extra.text(d_extra.text().trim().replace(/^(?:Winning|Losing) (?:Vice )?President \((.+)\)$/, '$1') 
							  + (d_extra.text().match(/Vice President/) ? ' (VP)' : ''));
					var party = d_extra.text().match(/^(.*?)(\(|$)/)[1].trim();
					d_extra.next('.d_value').css({backgroundColor: ((party == 'Democratic' || party == 'Democratic & Populist') ? '#aaf' : party == 'Republican' ? '#f77' : '#ccc')})
				});
			}
		},

	};
	
	$.each(games, (key, options) => {
		if (window.location.href.indexOf(key) >= 0) {
			console.log(key, options);
			if (options.enabled === false) return;
			
			if (options.moreColumns)         moreColumns();
			if (options.unshuffleAnswers)    unshuffleAnswers();
			if (options.unRandomize)         unRandomize();
			if (options.autofill)            autofill(options.autofill);
			if (options.autofillForcedOrder) autofillForcedOrder();
			if (options.trimAnswers)         trimAnswers(options.trimAnswers);
			if (options.hints)               addHints(options.hints);
			
			if (options.styles) $(`<style>${options.styles}</style>`).appendTo('head');
			
			if (typeof options.fn == 'function') {
				options.fn.apply(null, options.args);
			} else if (Array.isArray(options.fn)) {
				$.each(options.fn, (i,f) => f.call());
			}
			
		}
	});
	
	clickToSort();
	
	function clickToSort() {
		
		// TODO: sort as new answers are entered
		
		$('.gametable-col th').click((event) => {
			
			var th = $(event.target);
			var colno = th[0].cellIndex;
			
			var tables;
			if (th.closest('td.gametable-col').is('.grouped-col')) {
				// sort just this column
				tables = th.closest('table.data');
			} else {
				// combine all columns
				tables = th.closest('#gameTable').find('table.data');
			}
			var rows = tables.find('tr').not(':has(th)').toArray();
			
			if (th.is('.sjo-sorted')) {
				
				// put back in original slot order
				rows.sort((rowA,rowB) => {
					var slotA = $(rowA).find('td.d_value').attr('id').match(/\d+/)[0] - 0;
					var slotB = $(rowB).find('td.d_value').attr('id').match(/\d+/)[0] - 0;
					return slotA - slotB;
				});

				th.removeClass('sjo-sorted');
				
			} else {

				rows.sort((rowA,rowB) => {
					
					var strA = rowA.cells[colno].innerText.trim();
					var strB = rowB.cells[colno].innerText.trim();
					
					var numA = strA.replace(/,/g, '') - 0;
					var numB = strB.replace(/,/g, '') - 0;
					
					var result;
					
					// sort blanks at the end
					if (strA === '' && strB === '') {
						result = 0;
					} else if (strA === '') {
						result = 1;
					} else if (strB === '') {
						result = -1;
						
					} else if (isNaN(numA) || isNaN(numB)) {
						
						// sort as strings
						if (strA < strB) {
							result = -1;
						} else if (strA > strB) {
							result = 1;
						} else {
							result = 0;
						}
						
					} else {
						
						// sort as numbers
						// TODO: allow sorting ascending and descending
						result = numA - numB;
						
					}

					return result;

				});
				
				// FIXME: write to all columns
				th.addClass('sjo-sorted');
			
			}
			
			// distribute sorted rows across columns
			var numRowsTotal = rows.length;
			var numRowsPerCol = Math.ceil(rows.length / tables.length);
			tables.each((i,e) => {
				var table = $(e);
				var numRowsThisCol = (i == tables.length - 1) ? rows.length : numRowsPerCol;
				var rowsThisCol = rows.splice(0, numRowsThisCol);
				table.append(rowsThisCol);
			});
			
		});
		
		$('#gameinput').focus();
		
	}
	
	function unRandomize() {
		
		var tables = $('table.data');
		var rows = tables.find('tr').not(':has(th)').toArray();
		
		// put back in original slot order
		rows.sort((rowA,rowB) => {
			var slotA = $(rowA).find('td.d_value').attr('id').match(/\d+/)[0] - 0;
			var slotB = $(rowB).find('td.d_value').attr('id').match(/\d+/)[0] - 0;
			return slotA - slotB;
		});
		
		// distribute sorted rows across columns
		var numRowsTotal = rows.length;
		var numRowsPerCol = Math.ceil(rows.length / tables.length);
		tables.each((i,e) => {
			var table = $(e);
			var numRowsThisCol = (i == tables.length - 1) ? rows.length : numRowsPerCol;
			var rowsThisCol = rows.splice(0, numRowsThisCol);
			table.append(rowsThisCol);
		});
		
	}
	
	function trimAnswers(options) {
		
		/* FIXME: move right-aligned answers closer to markers
		$('.d_value, .marker').show();
		$('.d_value').each((i,e) => {
			var slot = $(e);
			var marker = $(`#${e.id.replace(/slot/, 'marker')}`);
			console.log(marker.offset().top, marker.offset().left, marker.width(), slot.offset().top, slot.offset().left, slot.width());
		});
		$('.d_value, .marker').hide();
		*/
		
		var timer, start;
		$('body').on('keypress', '#gameinput', event => {
			if (!timer) {
				timer = window.setInterval(_trimAnswers, 100);
				start = Date.now();
			}
		});
		
		function _trimAnswers() {
			if (Date.now() - start > 1000) {
				window.clearInterval(timer);
				timer = null;
			}
			$('.d_value').filter(':visible').each((i,e) => {
				if (e.innerText.match(options.replace)) {
					e.innerText = e.innerText.replace(options.replace, '');
					window.clearInterval(timer);
					timer = null;
					var slot = $(e);
					var marker = $(`#${e.id.replace(/slot/, 'marker')}`);
					//console.log(marker.offset().top, marker.offset().left, marker.width(), slot.offset().top, slot.offset().left, slot.width());
					//window.setTimeout(() => {console.log(marker.offset().top, marker.offset().left, marker.width(), slot.offset().top, slot.offset().left, slot.width());}, 2000);
				}
			});
		}
		
	}
	
	// Widen the play area and double the number of columns
	function moreColumns() {
		$(`<style>#page-wrapper {width: auto;}</style>`).appendTo('head');
		$('#gameTable > tbody > tr:nth-of-type(2n)').each((index, element) => $(element).prev('tr').append(element.cells));
	}
	
	function unshuffleAnswers() {
		
		var cells = $('.data tr:not(:has(th))');
		var columns = $('.data');
		var columnLengths = columns.toArray().map(e => $(e).find('tr:not(:has(th))').length);
		
		var timer = window.setInterval(_unshuffleAnswers, 50);
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
			
			if (unsortedCells.length > 0) {
				
				var sortedCellsArray = cells.toArray().sort((a, b) => {
					if (a.innerText.trim() == b.innerText.trim()) return 0;
					if (a.innerText.trim() == '') return 1;
					if (b.innerText.trim() == '') return -1;
					return (a.innerText.trim() > b.innerText.trim() ? 1 : -1);
				});
				
				var start = 0, end;
				for (var i = 0; i < columns.length; i++) {
					end = start + columnLengths[i];
					columns.eq(i).append(sortedCellsArray.slice(start, end));
					start = end;
				}
				
			}
			
		}
	}
	
	function addHints(hints) {
		$('.d_value').each((index, element) => $(`<span class="sjo-hint">${hints[index]}</span>`).appendTo(element));
	}
	
	$('body').on('keypress', '#gameinput', event => {
		if (event.originalEvent.key === 'ArrowDown' ? $('#nextButton').click() : event.originalEvent.key === 'ArrowUp' ? $('#previousButton').click() : '');
	});
	
	// Click to retry value
	$('.d_value').click(event => {
		
		var values = [];
		$('.d_value').each((i,e) => {
			if ($('.sjo-hint', e).length > 0) return;
			var newValues = e.innerText.trim().replace(/\(.*?\)/g, '').replace(/ & /, ', ').split(', ').map(text => text.trim());
			if (newValues.join('').length == 0) return;
			console.log(newValues);
			values = values.concat(newValues);
		});
		
		window.setTimeout(enterValue, 0);
		
		function enterValue() {
			if (values.length == 0) {
				$('#gameinput').focus().val('');
				return;
			}
			var value = values.pop();
			$('#gameinput').focus().val(value).trigger($.Event("input"));
			window.setTimeout(enterValue, 0);
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
	
	function autofillForcedOrder() {
		var gameinput = $('#gameinput');
		var valueCells = $('.d_value:visible');
		var knownValues = [''];
		var mainTimer = window.setInterval(_autofill, 100);
		
		function _autofill() {
			if (!$('body').is('.active')) return;
			var currentValues = valueCells.toArray().map(e => e.innerText.trim());
			for (var i = 0; i < currentValues.length; i++) {
				if (knownValues.indexOf(currentValues[i]) < 0) {
					
					window.clearInterval(mainTimer);
					var newValue = currentValues[i];
					knownValues.push(newValue);
					
					valueCells.filter((i,e) => e.innerText.trim() != '').addClass('sjo-checked');
					var valueTimer = window.setInterval(_autofillValue, 20);
					break;
					
					function _autofillValue() {
						
						var uncheckedCells = valueCells.not('.sjo-checked');
						if (uncheckedCells.length == 0) {
							window.clearInterval(valueTimer);
							valueCells.removeClass('sjo-checked');
							gameinput.val('');
							$('#nextButton').click();
							mainTimer = window.setInterval(_autofill, 100);
							return;
						}
						
						var activeCell = $('.valueactive');
						
						if (activeCell.is('.sjo-checked')) {
							$('#nextButton').click();
							return;
						}
						
						activeCell.addClass('sjo-checked')
						gameinput.val(newValue).trigger($.Event("input"));
						
					}
					
				}
			}
		}
		
	}
	
});
