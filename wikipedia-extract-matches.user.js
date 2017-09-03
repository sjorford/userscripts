// ==UserScript==
// @id             wikipedia-extract-matches@wikipedia.org@sjorford@gmail.com
// @name           Wikipedia extract matches
// @version        2017-09-03
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @include        http://en.wikipedia.org/wiki/*
// @include        https://en.wikipedia.org/wiki/*
// @run-at         document-end
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	var tweakCountry = {
		'China PR': 'China',
		'Chinese Taipei': 'Taiwan',
		'Congo': 'Congo Republic',
		'DR Congo': 'Congo DR',
		'Saint Kitts and Nevis': 'St Kitts and Nevis',
		'Saint Lucia': 'St Lucia',
		'Saint Vincent and the Grenadines': 'St Vincent and the Gren.',
		'São Tomé and Príncipe': 'Sao Tome and Principe',
		'Timor-Leste': 'East Timor',
		'U.S. Virgin Islands': 'US Virgin Islands',
	};
	
	var tweakCity = {
		'São Tomé': 'Sao Tome',
	};
	
	// Hack to identify host venues
	var tweakCityCountry = {
		"Nuku'alofa": "Tonga",
		"Port Moresby": "Papua New Guinea",
	};
	
	var events = $('.vevent')
	if (events.length > 0) {

		var div = $('<div class="sjodiv" style="position: absolute; background-color: white; border: 1px solid black; font-size: 9pt; overflow: scroll;" />').click(function() {selectRange('.sjotable');}).hide().appendTo('body');
		var table = $('<table class="sjotable"></table>').appendTo(div);
		$('<a style="position: absolute; right: 0px; top: 0px; font-size: larger;" href="#">Close</a>').click(hideData).appendTo(div);

		$(window).resize(resizeExtract);
		resizeExtract();

		var openButton = $('<a href="#">Extract matches</a>').appendTo('#p-cactions .menu ul').wrap('<li></li>').click(showData);
		$('#p-cactions').removeClass('emptyPortlet');

		var addBreak = false;
		events.add('h3:not(:has([id^=Matchday_]))').each(function(){

			if (this.tagName == 'H3') {
				addBreak = true;
			} else {

				var matchWrapper = $(this);

				var dateWrapper = matchWrapper.children('table:first-of-type');
				var date = dateWrapper.text().trim().replace(/\n/g, ' ').replace(/\[/g, ' ').split(/\s+/);
				if (date.length >= 3) date = [date[0], date[1].substr(0, 3), date[2]];
				date = date.join(' ');

				var resultWrapper = matchWrapper.children('table:nth-of-type(2)');

				var teams = [];
				teams[0] = resultWrapper.find('.attendee:first-of-type, .vcard:first-of-type').text().trim();
				teams[1] = resultWrapper.find('.attendee:last-of-type, .vcard:last-of-type').text().trim();
				if (tweakCountry[teams[0]]) teams[0] = tweakCountry[teams[0]];
				if (tweakCountry[teams[1]]) teams[1] = tweakCountry[teams[1]];

				var scoreWrapper = resultWrapper.find('th:not(.attendee, .vcard)');
				var scoreText = scoreWrapper.text().trim();
				var scoreMatches = scoreText.match(/^(\d+)\s*(\u2013|\u2212|-)\s*(\d+)/);
				var score = (scoreMatches && scoreMatches.length >= 4) ? [scoreMatches[1], scoreMatches[3]] : ['', ''];

				var stadium = '', city = '', country = '', neutral = '';
				var miscWrapper = matchWrapper.children('table:last-of-type');
				var misc = miscWrapper.text().trim().split('\n');
				var venueParts = misc[0].match(/^([^,\[]*)(, (.*?)( \((.*)\))?(\[.*\])?)?$/);
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
				var att = (misc.length < 2) ? '' : ((misc[1].indexOf('Attendance: ') == 0) ? misc[1].replace('[', ' ').split(' ')[1] : '');

				if (addBreak) {
					if (table.find('tr').length > 0) {
						table.append('<tr><td><br></td></tr>');
					}
					addBreak = false;
				}

				$('<tr></tr>')
					.append('<td>' + date     + '</td>')
					.append('<td>' + city     + '</td>')
					.append('<td>' + teams[0] + '</td>')
					.append('<td>' + score[0] + '</td>')
					.append('<td>' + score[1] + '</td>')
					.append('<td>' + teams[1] + '</td>')
					.append('<td>' + stadium  + '</td>')
					.append('<td>' + att      + '</td>')
					.append('<td>' + neutral  + '</td>')
					.appendTo(table);

			}

		});

		if ($('th > abbr[title="Points"]').length == 0) {
			$('<tr></tr>').append('<td></td>'.repeat(9)).appendTo(table);
			$('tr:nth-of-type(even)', table).appendTo(table);
		}

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

	function selectRange(element) {
		element = $(element).get(0);
		var range = document.createRange();
		range.selectNodeContents(element);
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}

});
