﻿// ==UserScript==
// @name           Boxrec extract 2
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.09.28.0
// @match          http://boxrec.com/
// @match          http://boxrec.com/en/
// @grant          none
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

// TODO:
// pause button
// auto pause
// auto resume
// countdown clock
// stats (bouts output/boxers output/boxers in queue)

$(function() {
	
	polyfill();
	
	$(`<style class="sjo-style">
		.sjo-iframe {display: none; width: 80%;}
		.sjo-output {display: block; width: 80%; height: 10em;}
	</style>`).appendTo('head');
	
	var titles = {
		6:   {text: 'World Boxing Council World', abbr: 'WBC'},
		41:  {text: 'World Boxing Association World', abbr: 'WBA'},
		43:  {text: 'World Boxing Association Super World', abbr: 'WBA+'},
		75:  {text: 'International Boxing Federation World', abbr: 'IBF'},
		91:  {text: 'World Boxing Organisation World', abbr: 'WBO'},
		189: {text: 'International Boxing Organization World', abbr: 'IBO'},
	};
	
	$('<input type="button" value="Start extract">').appendTo('body').click(start);
	
	var iframe, outputBouts, outputBoxers;
	
	// Start with Anthony Joshua
	var boxerIDs = ["659461"];
	var boxerIndex = 0;
	
	function start() {

		// Create iframe
		iframe = $('<iframe class="sjo-iframe" src="http://boxrec.com/en/contact_us"></iframe>').appendTo('body')
				.on('load', parsePage);

		// Create output areas
		outputBouts = $('<textarea class="sjo-output">').appendTo('body').click(e => e.target.select());
		outputBoxers = $('<textarea class="sjo-output">').appendTo('body').click(e => e.target.select());
		
		// Load seed page into iframe
		loadPage();
		
	}
	
	function loadPage() {
		var url = `http://boxrec.com/en/boxer/${boxerIDs[boxerIndex]}`;
		console.log(url);
		iframe.attr('src', url);
	}

	function parsePage() {

		var doc = iframe[0].contentDocument;

		// Parse profile
		// ================================================================

		var boxer = {};

		boxer.id = iframe[0].contentWindow.location.href.match(/\d+$/)[0];
		boxer.name = $('.profileTable .defaultTitleAlign h1', doc).text();
		console.log(boxer);

		var wrapperWLD = $('.profileWLD', doc);

		boxer.WLD = {};
		boxer.WLD.W = wrapperWLD.find('.bgW').text();
		boxer.WLD.L = wrapperWLD.find('.bgL').text();
		boxer.WLD.D = wrapperWLD.find('.bgD').text();

		boxer.KO = {};
		boxer.KO.W = wrapperWLD.find('.textWon').text().match(/\d+/)[0];
		boxer.KO.L = wrapperWLD.find('.textLost').text().match(/\d+/)[0];

		var wrapperProfile = $('td.profileTable', doc).last();

		boxer.bouts = $('td:containsExact("bouts") + td', wrapperProfile).text().fullTrim();
		boxer.nickname = $('td:containsExact("alias") + td', wrapperProfile).text().fullTrim();
		boxer.dateOfBirth = $('td:containsExact("born") + td', wrapperProfile).text().fullTrim().split(' ')[0];
		boxer.nationality = $('td:containsExact("nationality") + td', wrapperProfile).text().fullTrim();

		// Append to textarea
		var outputString =
			clean(boxer.id) + '\t' +
			clean(boxer.name) + '\t' +
			clean(boxer.nickname) + '\t' +
			clean(boxer.dateOfBirth) + '\t' +
			clean(boxer.nationality) + '\t' +
			clean(boxer.bouts) + '\t' +
			clean(boxer.WLD.W) + '\t' +
			clean(boxer.WLD.L) + '\t' +
			clean(boxer.WLD.D) + '\t' +
			clean(boxer.KO.W) + '\t' +
			clean(boxer.KO.L);

		outputBoxers.val(outputBoxers.val() + outputString + "\n");

		// Parse bouts
		// ================================================================

		$('.dataTable > tbody > tr', doc).not('.SR').each((index, element) => {

			var row = $(element);
			var cells = row.find('td');

			var bout = {};
			bout.date = cells.eq(1).text().trim();

			bout.boxers = [];
			bout.boxers[0] = {};
			bout.boxers[0].id = boxer.id;
			bout.boxers[0].name = boxer.name;
			bout.boxers[0].weight = parseWeight(cells.eq(2).text());

			bout.boxers[1] = {};
			var boxerLink = cells.eq(4).find('a');
			if (boxerLink.length > 0) {
				bout.boxers[1].id = boxerLink.attr('href').match(/\d+$/)[0];
				bout.boxers[1].name = boxerLink.text();
				bout.boxers[1].weight = parseWeight(cells.eq(5).text());
			}

			bout.venue = {};
			bout.venue.country = cells.eq(8).find('.flag').attr('class').split(' ')[1].toUpperCase();
			var venueMatch = cells.eq(8).text().trim().match(/(.*), (.*)/);
			if (venueMatch) {
				bout.venue.name = venueMatch[1];
				bout.venue.city = venueMatch[2];
			} else {
				bout.venue.city = cells.eq(8).text().trim();
			}

			bout.result = cells.eq(9).text().trim();

			decisionMatch = cells.eq(10).text().match(/(\w+)?\s*(([\d\?]+)\/)?([\d\?]+)/);
			bout.decision = decisionMatch[1];
			bout.lastRound = decisionMatch[3];
			bout.totalRounds = decisionMatch[4];

			// Parse titles
			// ================================================================

			var secondRow = row.next('.SR');

			bout.titles = {};
			bout.weightClasses = [];

			secondRow.find('.titleLink').each((index, element) => {

				var titleLink = $(element);
				var titleLinkMatch = titleLink.attr('href').match(/(\d+)\/(.+)$/);
				var titleID = titleLinkMatch[1];

				if (titles[titleID]) {

					var titleRegex = new RegExp("^((.+) )?" + titles[titleID].text + " (.+) Title$");
					var titleMatch = titleLink.text().fullTrim().match(titleRegex);

					if (titleMatch) {

						if (titleMatch[2] == 'vacant') {
							bout.titles[titles[titleID].abbr] = 'vac';
						} else if (titleMatch[2] == 'interim') {
							bout.titles[titles[titleID].abbr] = 'int';
						} else if (titleMatch[2]) {
							bout.titles[titles[titleID].abbr] = '?';
						} else {
							bout.titles[titles[titleID].abbr] = 'def';
						}

						var weightClass = titleMatch[3];

						if (bout.weightClasses.indexOf(weightClass) < 0 ) {
							bout.weightClasses.push(weightClass);
						}

					} else {
						bout.titles[titles[titleID].abbr] = '?';
						bout.weightClasses.push('?');
					}

				}

			});
			
			// Add championship boxers to list
			if (bout.boxers[1].id && bout.weightClasses.length > 0) {
				if (boxerIDs.indexOf(bout.boxers[1].id) < 0) 
					boxerIDs.push(bout.boxers[1].id);
			}

			// Append to textarea
			// ================================================================

			var outputString =
				clean(bout.date) + '\t' +
				clean(bout.boxers[0].id) + '\t' +
				clean(bout.boxers[0].name) + '\t' +
				clean(bout.boxers[0].weight) + '\t' +
				clean(bout.boxers[1].id) + '\t' +
				clean(bout.boxers[1].name) + '\t' +
				clean(bout.boxers[1].weight) + '\t' +
				clean(bout.venue.name) + '\t' +
				clean(bout.venue.city) + '\t' +
				clean(bout.venue.country) + '\t' +
				clean(bout.result) + '\t' +
				clean(bout.decision) + '\t' +
				clean(bout.lastRound) + '\t' +
				clean(bout.totalRounds) + '\t' +
				clean(bout.titles['WBC']) + '\t' +
				clean(bout.titles['WBA']) + '\t' +
				clean(bout.titles['WBA+']) + '\t' +
				clean(bout.titles['IBF']) + '\t' +
				clean(bout.titles['WBO']) + '\t' +
				clean(bout.titles['IBO']) + '\t' +
				clean(bout.weightClasses.join('/'));

			outputBouts.val(outputBouts.val() + outputString + "\n");

		});

		outputBouts.val(outputBouts.val() + "\n");

		// Load next page
		boxerIndex++;
		console.log(boxerIndex, boxerIDs);
		if (boxerIndex < boxerIDs.length) {
			loadPage();
		}

	}

	function parseWeight(value) {
		if (value.trim() == '') return '';
		return parseInt(value.replace(/¼/, '.25').replace(/½/, '.5').replace(/¾/, '.75'));
	}

	function clean(value) {
		if (value === null || value === undefined) return ''; else return value;
	}
	
	function polyfill() {

		if (!String.prototype.fullTrim) {
			String.prototype.fullTrim = function() {
				return this.trim().replace(/(\s|\n|\r)+/g, ' ');
			};
		}
		
		$.expr[":"].containsExact = function(a, i, m) {
			return $(a).text().fullTrim() == m[3].fullTrim();
		};
		
	}
	
});
