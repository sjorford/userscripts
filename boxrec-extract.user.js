// ==UserScript==
// @name           Boxrec extract
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2018.10.10.0
// @match          http://boxrec.com/
// @match          http://boxrec.com/en/
// @grant          none
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

// TODO:
// trim venue, see 578597 Antonio Tostado Garcia
// trim opponent name, see 9011 Danny Lopez v 16300 Jose Luis Valdovinos

$(function() {
	
	var startBoxerIDs = ["677961", "659461"];
	var pauseAfter = 1000;
	
	polyfill();
	
	$(`<style class="sjo-style">
		.sjo-wrapper {background-color: white;}
		.sjo-iframe {display: none;}
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
	
	var wrapper = $('<div class="sjo-wrapper"></div>').appendTo('body');
	
	$('<input type="button" class="sjo-start" value="Start extract">').appendTo(wrapper).click(start);
	
	var iframe;
	var outputBouts = [], outputBoxers = [];
	var boutIDs = [];
	
	var boxerIDs = startBoxerIDs;
	var boxerIndex = 0;
	var numBouts = 0;
	var paused = false;
	
	function start() {
		
		$('.sjo-start').hide();
		
		$('<label for="sjo-autopause">Autopause:</label> <input id="sjo-autopause" type="number">').attr('value', pauseAfter).appendTo(wrapper);
		$('<span id="sjo-status">Bouts: <span id="sjo-status-bouts"></span> Boxers: <span id="sjo-status-boxers"></span> of <span id="sjo-status-queue"></span></span>').appendTo(wrapper);
		
		$('<input type="button" id="sjo-pause" value="Pause">').appendTo(wrapper).click(() => {
			$('#sjo-pause, #sjo-resume').toggle();
			paused = true;
		});
		
		$('<input type="button" id="sjo-resume" value="Resume">').appendTo(wrapper).hide().click(() => {
			$('#sjo-pause, #sjo-resume').toggle();
			paused = false;
			loadPage();
		});
		
		$('<input type="button" id="sjo-show" value="Show">').appendTo(wrapper).click(() => {
			$('#sjo-outputboxers').val(outputBoxers.join('\n'));
			$('#sjo-outputbouts').val(outputBouts.join('\n'));
			$('.sjo-output').toggle();
			$('#sjo-show, #sjo-hide').toggle();
		});
		
		$('<input type="button" id="sjo-hide" value="Hide">').appendTo(wrapper).hide().click(() => {
			$('.sjo-output').toggle();
			$('#sjo-show, #sjo-hide').toggle();
		});
		
		// Create iframe
		iframe = $('<iframe class="sjo-iframe" src="http://boxrec.com/en/contact_us"></iframe>')
					.appendTo('body').on('load', parsePage);

		// Create output areas
		$('<textarea id="sjo-outputboxers" class="sjo-output">').appendTo('body').hide().click(e => e.target.select());
		$('<textarea id="sjo-outputbouts" class="sjo-output">').appendTo('body').hide().click(e => e.target.select());
		
		// Load seed page into iframe
		loadPage();
		
	}
	
	function loadPage() {
		
		if (paused) return;
		
		var autopause = $('#sjo-autopause').val();
		if (boxerIndex >= ($.isNumeric(autopause) ? parseInt(autopause) : 0)) {
			$('#sjo-pause').click();
			$('#sjo-autopause').val(boxerIndex + pauseAfter);
			return;
		}
		
		var url = `http://boxrec.com/en/boxer/${boxerIDs[boxerIndex]}`;
		iframe.attr('src', url);
	}

	function parsePage() {
		
		var doc = iframe[0].contentDocument;
		
		// Parse profile
		// ================================================================
		
		var boxer = {};
		
		boxer.id = iframe[0].contentWindow.location.href.match(/\d+$/)[0];
		boxer.name = $('.profileTable .defaultTitleAlign h1', doc).text();
		
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

		outputBoxers.push(outputString);

		// Parse bouts
		// ================================================================

		$('.dataTable > tbody > tr', doc).not('.SR').each((index, element) => {

			var row = $(element);
			var cells = row.find('td');
			
			var bout = {};
			bout.date = cells.eq(1).text().trim();
			
			[bout.event, bout.id] = row.find('.boutP').closest('a').attr('href').split('/').slice(-2);
			
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
				bout.venue.name = venueMatch[1].trim();
				bout.venue.city = venueMatch[2].trim();
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
			
			if (!(bout.result == 'L' && boutIDs.indexOf(bout.id) >= 0)) {
				
				var outputString =
					clean(bout.id) + '\t' +
					clean(bout.event) + '\t' +
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
				
				outputBouts.push(outputString);
				numBouts++;
				
			}
			
		});
		
		// Load next page
		boxerIndex++;
		$('#sjo-status-bouts').text(numBouts);
		$('#sjo-status-boxers').text(boxerIndex + 1);
		$('#sjo-status-queue').text(boxerIDs.length);
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
