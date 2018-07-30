// ==UserScript==
// @id             wikipedia-extract-matches@wikipedia.org@sjorford@gmail.com
// @name           Wikipedia extract matches
// @version        2018.07.30.0
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @include        https://en.wikipedia.org/wiki/*
// @run-at         document-end
// @grant          none
// ==/UserScript==

$(function() {
	
	console.log('Wikipedia extract matches');
	
	polyfill();
	
	var tweakCountry = {
		//'Dahomey':                       'Benin',
		//'Upper Volta':                   'Burkina Faso',
		//'Khmer Republic':                'Cambodia',
		'China PR':                      'China',
		//'Congo':                         'Congo Republic',
		//'Congo-Brazzaville':             'Congo Republic',
		//'Congo-Léopoldville':            'Congo DR',
		//'Congo-Kinshasa':                'Congo DR',
		//'Zaire':                         'Congo DR',
		'DR Congo':                      'Congo DR',
		'Territory of Curaçao':          'Curaçao',
		//'Timor-Leste':                   'East Timor',
		//'Palestine, British Mandate':    'Israel',
		"Côte d'Ivoire":                 'Ivory Coast',
		//'Burma':                         'Myanmar',
		'Ireland (IFA)':                 'Northern Ireland',
		'Ireland (FAI)':                 'Republic of Ireland',
		//'Irish Free State':              'Republic of Ireland',
		'St Kitts and Nevis':            'Saint Kitts and Nevis',
		'St Lucia':                      'Saint Lucia',
		'St Vincent and the Grenadines': 'Saint Vincent and the Grenadines',
		'Saint Vincent':                 'Saint Vincent and the Grenadines',
		//'Western Samoa':                 'Samoa',
		'São Tomé and Príncipe':         'Sao Tome and Principe',
		'Korea Republic':                'South Korea',
		//'Ceylon':                        'Sri Lanka',
		//'Chinese Taipei':                'Taiwan',
		//'Republic of China':             'Taiwan',
		'United Arab Rep.':              'United Arab Republic',
		'U.S. Virgin Islands':           'US Virgin Islands',
		//'New Hebrides':                  'Vanuatu',
	};
	
	var tweakCity = {
		'São Tomé': 'Sao Tome',
	};
	
	// Hack to identify host venues
	var tweakCityCountry = {
		"Nuku'alofa": "Tonga",
		"Port Moresby": "Papua New Guinea",
	};
	
	var eventsFull = $('div[itemtype="http://schema.org/SportsEvent"]')
	var eventsBrief = $('tr').filter(
		(i, tr) => {
			var x = $(tr).find('*').toArray().map(e => e.tagName.toLowerCase()).join(' ');
			return x == 'td a span img td a td span span img a td a a';
		});
	var eventsCards = $('.vevent');
	var everything = eventsFull.add(eventsBrief).add(eventsCards);
	
	if (everything.length > 0) {
		
		var headings = $('h2, h3, h4')
			.not(':has([id^=Matchday_])')
			.not(':has(span[id*="_vs_"])')
			.not(':has(span[id^="First_Leg"], span[id^="Second_Leg"], span[id^="First_leg"], span[id^="Second_leg"], span[id^="Replay"])');
		var dateRows = eventsBrief.prev('tr').not(eventsBrief);
		everything = everything.add(headings).add(dateRows);
		console.log('everything', everything);
		
		var div = $('<div class="sjodiv" style="position: absolute; background-color: white; border: 1px solid black; font-size: 9pt; overflow: scroll;" />').hide().appendTo('body');
		var table = $('<table class="sjotable"></table>').appendTo(div);
		div.click(() => table.selectRange());
		$('<a style="position: absolute; right: 0px; top: 0px; font-size: larger;" href="#">Close</a>').click(hideData).appendTo(div);

		$(window).resize(resizeExtract);
		resizeExtract();

		var openButton = $('<a href="#">Extract matches</a>').appendTo('#p-cactions .menu ul').wrap('<li></li>').click(showData);
		$('#p-cactions').removeClass('emptyPortlet');

		var addBreak = false;
		var currentDate;
		
		everything.each(function(){
			
			if (headings.is(this)) {

				// Blank rows between groups/stages
				addBreak = true;
				console.log('break', this);
				
			} else if (eventsFull.is(this)) {
				
				// Standard match format
				var matchWrapper = $(this);
				console.log('standard row', this);
				
				var date = matchWrapper.find('time span.dtstart').first().text().trim();
				if (!date) date = matchWrapper.find('time').text().trim().match(/^(\d{1,2} [JFMASOND][a-z]+ \d{4})?/)[1];
				if (!date) {
					var dateParts = matchWrapper.find('time').text().trim().match(/^(([JFMASOND][a-z]+) (\d{1,2}), (\d{4}))?/);
					if (dateParts[1]) date = dateParts[3] + ' ' + dateParts[2] + ' ' + dateParts[4];
				}
				if (!date) date = '';
				
				var teams = [];
				teams[0] = matchWrapper.find('[itemprop="homeTeam"]').text().trim();
				teams[1] = matchWrapper.find('[itemprop="awayTeam"]').text().trim();
				if (tweakCountry[teams[0]]) teams[0] = tweakCountry[teams[0]];
				if (tweakCountry[teams[1]]) teams[1] = tweakCountry[teams[1]];
				
				var score = parseScore(matchWrapper.find('[itemprop="homeTeam"]').next().text());
				
				var stadium = '', city = '', country = '', neutral = '';
				var locationWrapper = matchWrapper.find('[itemprop="location"]');
				var locationText = locationWrapper.text().trim();
				var attendanceText;
				if (locationText.match(/Attendance/)) {
					[, locationText, attendanceText] = locationText.match(/(.*)(Attendance.*)/);
				} else {
					attendanceText = locationWrapper.next(':contains("Attendance")').text().trim()
				}
				
				var location = locationText.trim().split('\n');
				var venueParts = location[0].match(/^([^,\[]*)(, (.*?)( \((.*)\))?(\[.*\])?)?$/);
				if (venueParts) {

					stadium = venueParts[1];
					city = (venueParts[3] ? venueParts[3].replace(/^St. /, 'St ') : '');
					if (tweakCity[city]) city = tweakCity[city];
					country = (venueParts[5] ? venueParts[5] : '');
					if (country == '' && tweakCityCountry[city]) country = tweakCityCountry[city];
					if (tweakCountry[country]) country = tweakCountry[country];

					if (country == teams[1]) {
						teams = [teams[1], teams[0]];
						score = [score[1], score[0]];
					} else if (country == teams[0]) {
						country = '';
					} else if (country != '') {
						neutral = 'N';
					}

				}
				
				var attendanceMatch = attendanceText.match(/Attendance:\s+([\d,]+)/);
				var attendance = attendanceMatch ? attendanceMatch[1] : '';

				if (addBreak) {
					console.log('adding break');
					if (table.find('tr').length > 0) {
						table.append('<tr><td><br></td></tr>');
					}
					addBreak = false;
				}
				
				writeRow(date, city, teams, score, stadium, attendance, neutral);
				
			} else if (dateRows.is(this)) {
				
				// Store current date
				currentDate = $(this).text().trim();
				console.log('date row', this);
				
			} else if (eventsBrief.is(this)) {
				
				// Brief match format
				var matchWrapper = $(this);
				var cells = matchWrapper.children('td');
				console.log('brief row', this);
				
				var teams = [];
				teams[0] = cells.eq(0).text().trim();
				teams[1] = cells.eq(2).text().trim();
				if (tweakCountry[teams[0]]) teams[0] = tweakCountry[teams[0]];
				if (tweakCountry[teams[1]]) teams[1] = tweakCountry[teams[1]];
				
				var score = parseScore(cells.eq(1).text());
				
				var venue = cells.eq(3).text().trim().split(', ');
				var stadium = venue[0];
				var city = venue[1];
				
				var attendance = '';
				var neutral = '';
				
				if (addBreak) {
					if (table.find('tr').length > 0) {
						table.append('<tr><td><br></td></tr>');
					}
					addBreak = false;
				}
				
				writeRow(currentDate, city, teams, score, stadium, attendance, neutral);
				
			} else if (eventsCards.is(this)) {
				
				// vcard match format
				var matchWrapper = $(this);
				var row1 = matchWrapper.find('tr').first();
				var row2 = row1.next('tr');
				var cells = row1.children('td, th');
				console.log('vcard row', this);
				
				var date = cells.eq(0).text().trim();
				
				var teams = [];
				teams[0] = cells.eq(1).text().trim();
				teams[1] = cells.eq(3).text().trim();
				if (tweakCountry[teams[0]]) teams[0] = tweakCountry[teams[0]];
				if (tweakCountry[teams[1]]) teams[1] = tweakCountry[teams[1]];
				
				var score = parseScore(cells.eq(2).text());
				
				var city = cells.eq(4).find('span:not([role="button"])').text().trim();
				var stadium = row2.find('.location').text().trim();
				var attParts = row2.find('.location').closest('td').text().match(/(Attendance:\s+([0-9,]+))/);
				var attendance = attParts ? attParts[2] : '';
				var neutral = '';
				
				if (addBreak) {
					if (table.find('tr').length > 0) {
						table.append('<tr><td><br></td></tr>');
					}
					addBreak = false;
				}
				
				writeRow(date, city, teams, score, stadium, attendance, neutral);
				
			}
			
		});
		
		/*
		if ($('th > abbr[title="Points"]').length == 0) {
			console.log('whatever this is');
			$('<tr></tr>').append('<td></td>'.repeat(9)).appendTo(table);
			$('tr:nth-of-type(even)', table).appendTo(table);
		}
		*/
		
	}
	
	function writeRow(date, city, teams, score, stadium, attendance, neutral) {
		
		console.log(date);
		if (!date && !score[0] && !score[1]) return;
		
		var cityParts = city.match(/^(.*?), (.*)$/);
		if (!cityParts) cityParts = ['', city, ''];
		
		cityParts[1] = cityParts[1].replace(/\[[^\[\]]*\]/, '');
		cityParts[2] = cityParts[2].replace(/\[[^\[\]]*\]/, '');
		if (tweakCountry[cityParts[2]]) cityParts[2] = tweakCountry[cityParts[2]];
		
		var row = $('<tr></tr>')
			.addCell(date)
			.addCell(teams[0])
			.addCell(score.F)
			.addCell(score.A)
			.addCell(teams[1])
			.addCell(score.aet)
			.addCell('')
			.addCell('');
		
		if (score.pens) {
			row
			.addCell('pens')
			.addCell(score.pens.F)
			.addCell(score.pens.A);
		} else {
			row
			.addCell('')
			.addCell('')
			.addCell('');
		}
		
		row
			.addCell(stadium)
			.addCell(cityParts[1])
			.addCell(cityParts[2])
			.addCell(neutral)
			.addCell(attendance)
			.appendTo(table);
		
	}
	
	function parseScore(scoreText) {
		var scoreParts = scoreText.trim().match(/^(\d+)\s*[-\u2013\u2212]\s*(\d+)(\s*\((a\.e\.t\.|aet|a\.s\.d\.e\.t\.|asdet)\))?(\s*\((\d+)\s*[-\u2013\u2212]\s*(\d+)\s*(p|pens?)\.?\))?/);
		var score = {};
		if (scoreParts) {
			score.F = scoreParts[1];
			score.A = scoreParts[2];
			if (scoreParts[3]) score.aet = scoreParts[4].replace(/\./g, '');
			if (scoreParts[5]) score.pens = {F: scoreParts[6], A: scoreParts[7]};
		}
		return score;
	}
	
	function resizeExtract() {

		var w = $(window).width();
		var h = $(window).height();

		$('.sjodiv').css({
			'left':   w/6   + 'px',
			'top':    h/6   + 'px',
			'width':  w*2/3 + 'px',
			'height': h*2/3 + 'px',
		});

	}

	function showData() {
		$('.sjodiv').show();
		$('.sjotable').selectRange();
		return false;
	}

	function hideData() {
		$('.sjodiv').hide();
		return false;
	}
	
	$('body').click(event => {
		if ($(event.target).closest('.sjodiv').length == 0) hideData();
	});

	$('body').on('keydown', event => {
		if (event.key == 'Escape') hideData();
	});
	
	showData(); // ************************
	
});

function polyfill() {

	// Add a new cell to a table row
	(function($) {

		// Add cell with text content
		$.fn.addCell = function(text, className, id) {
			return _addCell(this, false, text, className, id, false);
		};

		// Add cell with HTML content
		$.fn.addCellHTML = function(html, className, id) {
			return _addCell(this, true, html, className, id, false);
		};

		// Add header cell with text content
		$.fn.addHeader = function(text, className, id) {
			return _addCell(this, false, text, className, id, true);
		};

		// Add header cell with HTML content
		$.fn.addHeaderHTML = function(html, className, id) {
			return _addCell(this, true, html, className, id, true);
		};

		function _addCell(obj, isHTML, content, className, id, header) {
			for (var i = 0; i < obj.length; i++) {
				var row = obj[i];
				if (row.tagName == 'TR') {
					var cell = header ? $('<th></th>') : $('<td></td>');
					if (content !== null && content !== undefined) {
						if (isHTML) cell.html(content); 
						else cell.text(content);
					}
					if (className) cell.addClass(className);
					if (id) cell.attr('id', id);
					cell.appendTo(row);
				}
			}
			return obj;
		}

	})(jQuery);

	// Select range
	(function($) {
		$.fn.selectRange = function() {
			var range = document.createRange();
			range.selectNodeContents(this.get(0));
			var selection = getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
			return this;
		};
	})(jQuery);

}
