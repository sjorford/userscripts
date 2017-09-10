// ==UserScript==
// @name        Demo Club bulk adding
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/bulk_adding/*
// @exclude     https://candidates.democracyclub.org.uk/bulk_adding/*/review/
// @version     2017-10-09
// @grant       none
// @require     https://raw.githubusercontent.com/sjorford/userscripts/master/democracyclub/democlub-utils.js
// ==/UserScript==

// TODO: pull this from localStorage
var knownPartiesOnly = true;

$(function() {
	
	$(`<style>
		
		.form_group h3 {display: none !important;}
		.form_group p {display: inline-block !important; vertical-align: top !important; width: 48% !important; padding-right: 1%; margin-bottom: 0 !important;}
		.form_group p input {margin-bottom: 0.5rem !important;}
		
		.sjo-bulkadd-listitem {list-style-type: none; margin-top: 0.5rem;}
		.sjo-bulkadd-selected {background-color: #fff1a3;}
		.sjo-bulkadd-listitem input {margin-bottom: 0 !important}
		.sjo-bulkadd-data {font-size: 0.75rem; xxxcolor: #aaa; margin-bottom: 0rem !important; list-style-type: none;}
		.sjo-bulkadd-link {font-weight: bold;}
		
	</style>`).appendTo('head');
	
	// TODO: allow party dropdowns to be deselected
	
	// Trim party selection
	formatPartySelects('select.party-select');
	
	// Add a checkbox for reversed names
	// TODO: add this to other edit pages
	$('<input type="checkbox" id="sjo-reverse" value="reverse" checked><label for="sjo-reverse">Surname first</label>').insertBefore('#bulk_add_form').wrapAll('<div></div>');
	
	// Add a checkbox to show all parties
	$('<input type="checkbox" id="sjo-allparties" value="allparties"><label for="sjo-allparties">Show all parties</label>').insertBefore('#bulk_add_form').wrapAll('<div></div>').change(showAllParties);
	
	// Hide noobstructions
	var heading = $('h3:contains("How to add or check candidates")');
	heading.next('ol').addClass('sjo-bulkadd-instructions').hide();
	$('<a role="button" style="font-size: small;">Show</a>').click(event => $('.sjo-bulkadd-instructions').toggle()).appendTo(heading).before(' ');
	
});

function showAllParties() {
	
	var checked = $('#sjo-allparties').prop('checked');
	var source = $(checked ? '#sjo-party-select-original' : '#sjo-party-select-trimmed');
	$('select.party-select').html(source.html());
	
}
