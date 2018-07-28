﻿// ==UserScript==
// @id             wikipedia-extract-matches@wikipedia.org@sjorford@gmail.com
// @name           Wikipedia extract matches
// @version        2018.07.28.2
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @include        https://en.wikipedia.org/wiki/*
// @run-at         document-end
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	console.log('Wikipedia extract matches');
	
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
		//'Timor-Leste':                   'East Timor',
		//'Palestine, British Mandate':    'Israel',
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
		
		var headings = $('h2, h3, h4').not(':has([id^=Matchday_])').not(':has(span[id*="_vs_"])');
		var dateRows = eventsBrief.prev('tr').not(eventsBrief);
		everything = everything.add(headings).add(dateRows);
		console.log('everything', everything);
		
		var div = $('<div class="sjodiv" style="position: absolute; background-color: white; border: 1px solid black; font-size: 9pt; overflow: scroll;" />').click(function() {selectRange('.sjotable');}).hide().appendTo('body');
		var table = $('<table class="sjotable"></table>').appendTo(div);
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
					if (dateParts) date = dateParts[3] + ' ' + dateParts[2] + ' ' + dateParts[4];
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
					console.log('here');
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
		
		if (!date && !score[0] && !score[1]) return;
		
		var cityParts = city.match(/^(.*?), (.*)$/);
		if (!cityParts) cityParts = ['', city, ''];
		
		cityParts[1] = cityParts[1].replace(/\[[^\[\]]*\]/, '');
		cityParts[2] = cityParts[2].replace(/\[[^\[\]]*\]/, '');
		if (tweakCountry[cityParts[2]]) cityParts[2] = tweakCountry[cityParts[2]];
		
		$('<tr></tr>')
			.append('<td>' + date        + '</td>')
			.append('<td>' + teams[0]    + '</td>')
			.append('<td>' + score[0]    + '</td>')
			.append('<td>' + score[1]    + '</td>')
			.append('<td>' + teams[1]    + '</td>')
			.append('<td>' + score[2]    + '</td>')
			.append('<td></td>')
			.append('<td></td>')
			.append('<td>' + stadium      + '</td>')
			.append('<td>' + cityParts[1] + '</td>')
			.append('<td>' + cityParts[2] + '</td>')
			.append('<td>' + neutral      + '</td>')
			.append('<td>' + attendance   + '</td>')
			.appendTo(table);
		
	}
	
	function parseScore(scoreText) {
		var scoreParts = scoreText.trim().match(/^(\d+)\s*(\u2013|\u2212|-)\s*(\d+)(\s*\((a\.e\.t\.|aet|a\.s\.d\.e\.t\.|asdet)\))?/);
		var score = ['', '', ''];
		if (scoreParts) {
			score[0] = scoreParts[1];
			score[1] = scoreParts[3];
			if (scoreParts[4]) score[2] = scoreParts[5].replace(/\./g, '');
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
		selectRange('.sjotable');
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
	
	function selectRange(element) {
		element = $(element).get(0);
		var range = document.createRange();
		range.selectNodeContents(element);
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}

});
