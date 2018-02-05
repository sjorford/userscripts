// ==UserScript==
// @name        Demo Club bulk adding
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/bulk_adding/*
// @exclude     https://candidates.democracyclub.org.uk/bulk_adding/*/review/
// @version     2018.02.05
// @grant       none
// @require     https://raw.githubusercontent.com/sjorford/userscripts/master/democracyclub/democlub-utils.js
// ==/UserScript==

// temporary fix due to c.dc script errors
// $(onready);
window.setTimeout(onready, 0);

function onready() {
	
	$(`<style>
		#bulk_add_form .form_group {display: none;}
		#bulk_add_form .form_group h3 {display: none;}
		#bulk_add_form .form_group p {display: inline-block; vertical-align: top; width: 48%; padding-right: 1%; margin-bottom: 0;}
		#bulk_add_form .form_group p input {margin-bottom: 0.5rem;}
	</style>`).appendTo('head');
	
	// TODO: allow party dropdowns to be deselected
	
	// Trim party selection
	Utils.formatPartySelects('select.party-select');
	
	// Add a checkbox for reversed names
	// TODO: add this to other edit pages
	$('<input type="checkbox" id="sjo-reverse" value="reverse" checked><label for="sjo-reverse">Surname first</label>').insertBefore('#bulk_add_form').wrapAll('<div></div>');
	
	// Add a checkbox to show all parties
	$('<input type="checkbox" id="sjo-allparties" value="allparties"><label for="sjo-allparties">Show all parties</label>').insertBefore('#bulk_add_form').wrapAll('<div></div>').change(Utils.showAllParties);
	
	// Show rows incrementally
	$('#bulk_add_form .form_group').first().show();
	$('#bulk_add_form input').on('change', event => $(event.target).closest('.form_group').next('.form_group').show());
	
	// Hide noobstructions
	var heading = $('h3:contains("How to add or check candidates")');
	heading.next('ol').addClass('sjo-bulkadd-instructions').hide();
	$('<a role="button" style="font-size: small;">Show</a>').click(event => $('.sjo-bulkadd-instructions').toggle()).appendTo(heading).before(' ');
	
}
