// ==UserScript==
// @name        Democracy Club tweaks
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/*
// @exclude     https://candidates.democracyclub.org.uk/media/*
// @version     2018.04.18.0
// @grant       none
// ==/UserScript==

// Restore correct line numbers in console log
//var console = Raven && Raven.p && Raven.p.log ? Raven.p : console;

// Parameters
var rootUrl = 'https://candidates.democracyclub.org.uk/';

// Styles
$(`<style>
	
	.header__masthead {padding: 0.25em 1em;}
	.header__nav {padding: 0.25em 0 0 0;}
	.header__hero {padding-bottom: 0.5em;}
	button, .button {margin-bottom: 0.5em;}
	
	.sjo-mysuggestion {background-color: #ffeb99 !important;}
	
	.counts_table td, .counts_table th {padding: 4px !important;}
	.select2-results {max-height: 500px !important;}
	.version .button {padding: 2px 4px !important}
	
	.content {padding-top: 0.5em;}
	
	h2 {margin-top: 0.5em !important; margin-bottom: 0.25em !important; padding-bottom: 0.25em !important;}
	h3 {font-size: 1.2rem;}
	h4 {font-size: 1.1rem;}
	#add_election_button {margin-bottom: 0;}
	
	.sjo-results-label {float: left; width: 50%; height: 1.5rem; padding-top: 7px;}
	.sjo-results-num {width: 100px !important; margin-bottom: 5px !important; text-align: right; -moz-appearance: textfield !important;}
	.sjo-total-error {background-color: #fbb !important;}
	#id_source {max-height: 80px;}
	.header__nav .large-4 {width: 33.33333% !important;}
	.header__nav .large-6 {width: 50% !important;}
	.header__nav .large-8 {width: 66.66667%; !important;}
	.candidates-list__person .button.secondary.small {margin-bottom: 0;}
	.missing_field {display: none;}
	.person__party_emblem img {max-height: 5em;}
	.finder__forms__container {width: 60% !important;}
	.header__hero {padding-top: 0 !important;}
	.header__hero h1 {font-size: 2rem !important;}
	.candidate-list {margin: 0.5em 0;}
	p {margin-bottom: 0.5rem;}
	.header__nav {padding: 1em 0 0 0;}
	h2 {font-size: 1.5rem;}
	
	.select2-result-label {font-size: 0.8rem; padding: 2px !important;}
	
	xxx.person__actions__action h2 {margin-top: 0 !important;}
	
	.document_viewer {min-height: 600px;}
	
	label {color: #222;}
	
</style>`).appendTo('head');

// temporary fix due to c.dc script errors
// $(onready);
window.setTimeout(onready, 0);

function onready() {
	
	var url = location.href;
	
	// Reformat various pages
	if (url.indexOf(rootUrl + 'moderation/suggest-lock') === 0) {
		formatLockSuggestions();
	} else if (url.indexOf(rootUrl + 'uk_results/posts/') === 0) {
		formatResultsPage();
	} else if (url.indexOf(rootUrl + 'uk_results/') === 0) {
		formatResultsPostList();
	}
	
	// TODO: hide long list of parties with no candidates
	// e.g. https://candidates.democracyclub.org.uk/numbers/election/local.city-of-london.2017-03-23/parties
	
	// Hide empty header
	var hero = $('.header__hero');
	var container = hero.find('.container');
	if (container.html().trim() === '') container.remove();
	if (hero.html().trim() === '') hero.remove();
	
	// Shortcuts
	$('body').on('keydown', event => {
		if (event.shiftKey && event.altKey && !event.ctrlKey && event.key == 'F') {
			$('html').scrollTop(0);
			$('input[name="q"]').focus();
			event.preventDefault();
		}
	});
	
}

// ================================================================
// Results
// ================================================================

function formatResultsPostList() {
	
	$('.content .columns h3').each((index, element) => {
		var heading = $(element);
		heading.closest('div').find('a').after(' ' + element.innerText);
		heading.hide();
	});
	
}

function formatResultsPage() {
	
	$('input[id^=id_memberships], #id_num_turnout_reported, #id_num_spoilt_ballots')
		.addClass('sjo-results-num')
		.prev('label')
		.addClass('sjo-results-label')
		.unwrap();
	
	// Check total
	$('body').on('input', '.sjo-results-num', validateResults);
	
	function validateResults() {
		
		// Get entered total
		var totalCell = $('#id_num_turnout_reported');
		if (totalCell.val() === '') return;
		var enteredTotal = parseInt(totalCell.val(), 10);
		
		// Sum all cells except total
		var sumTotal = $('.sjo-results-num').toArray().map(function(element, index) {
			var cell = $(element);
			return cell.prop('id') == 'id_num_turnout_reported' ? 0 : cell.val() === '' ? 0 : parseInt(cell.val(), 10);
		}).reduce(function(prev, curr) {
			return prev + curr;
		});
		
		// Compare values
		if (sumTotal == enteredTotal) {
			totalCell.removeClass('sjo-total-error');
		} else {
			totalCell.addClass('sjo-total-error');
			console.log('sum of votes', sumTotal, 'difference', sumTotal - enteredTotal);
		}
		
	}
	
	// Paste values
	$('<textarea id="sjo-results-paste"></textarea>').insertAfter('.container h1:first-of-type').on('paste', parsePastedResults);
	
	// TODO: add a checkbox to remember the source for next time
	//$('#id_source').val('http://gis.worcestershire.gov.uk/website/Elections/result2017.aspx');
	
	function parsePastedResults(event) {
		console.log(event);
		
		var text = event.originalEvent.clipboardData.getData('text');
		console.log(text);
		
		$('.sjo-results-label').each((index, element) => {
			var label = $(element);
			var input = label.next('.sjo-results-num');
			var name = label.text().match(/^(.*?)\s+\(/)[1];
			var regex = new RegExp(name + '\\s+([^0-9]+\\s+)?(\\d+)', 'i');
			var votesMatch = text.match(regex);
			console.log(name, regex, votesMatch);
			if (votesMatch) {
				input.val(votesMatch[2]);
			}
		});
		
		validateResults();
		
	}
	
}

// ================================================================
// Reformat lock suggestions page
// ================================================================

function formatLockSuggestions() {
	
	// Highlight my lock suggestions
	$('.container li').filter((index, element) => element.innerText.indexOf('User sjorford suggested locking this') >= 0).addClass('sjo-mysuggestion');
	
	// Group by election and sort
	var headings = $('.content h3');
	var elections = headings.toArray().map(element => $('a', element).attr('href').match(/election\/(.*?)\.\d{4}-\d{2}-\d{2}\//)[1]).sort();
	$.each(elections, (index, electionId) => {
		if (index != elections.indexOf(electionId)) return;
		var newHeading = $('<h2></h2>').text(electionId).appendTo('.content .container');
		var headingsGroup = headings.filter(':has(a[href*="/' + electionId + '."])').toArray().sort((a, b) => a.innerText < b.innerText);
		$.each(headingsGroup, (index, element) => $(element).next('ul').addBack().insertAfter(newHeading));
	});
	
}

// ================================================================
// General functions
// ================================================================

if (!String.prototype.fullTrim) {
	String.prototype.fullTrim = function() {
		return this.trim().replace(/(\s|\n|\r)+/g, ' ');
	};
}
