// ==UserScript==
// @name        Demo Club bulk adding review
// @namespace   sjorford@gmail.com
// @include     https://candidates.democracyclub.org.uk/bulk_adding/*/review/
// @version     2018.02.02
// @grant       none
// ==/UserScript==

// temporary fix due to c.dc script errors
// $(onready);
window.setTimeout(onready, 0);

function onready() {
	
	$(`<style>
		.sjo-bulkadd-listitem {list-style-type: none; margin-top: 0.5rem;}
		.sjo-bulkadd-selected {background-color: #fff1a3;}
		.sjo-bulkadd-listitem input {margin-bottom: 0 !important}
		.sjo-bulkadd-data {font-size: 0.75rem; xxxcolor: #aaa; margin-bottom: 0rem !important; list-style-type: none;}
		.sjo-bulkadd-link {font-weight: bold;}
	</style>`).appendTo('head');
	
	$('form h2').each((index, element) => {
		
		var nameMatch = element.innerText.trim().match(/^Candidate:\s+(\S+)\s+((.+)\s+)?(\S+)$/);
		console.log('addSearchLink', index, element, nameMatch);
		if (nameMatch && nameMatch[3]) {
			
			var fullName = nameMatch[1] + ' ' + nameMatch[3] + ' ' + nameMatch[4];
			var shortName = nameMatch[1] + ' ' + nameMatch[4];
			element.innerHTML = 'Candidate: <a href="https://candidates.democracyclub.org.uk/search?q=' + encodeURIComponent(shortName) + '" target="_blank">' + fullName + '</a>';
			
		}
		
	});
	
	$('form input[type="radio"]').each((index, element) => {
		
		// Get ID of matching person
		var input = $(element);
		var link = input.closest('label').addClass('sjo-bulkadd-listitem').find('a').addClass('sjo-bulkadd-link');
		if (link.length > 0) link.html(link.html().replace(/\(previously stood in .*? candidate\)/, ''));
		var personID = input.val();
		if (personID == '_new') return;
		
		// Call API
		$.getJSON(`/api/v0.9/persons/${personID}/`, data => renderBulkAddData(input, data));

	});
	
	function renderBulkAddData(input, data) {
		input.closest('label')
			.append('<ul class="sjo-bulkadd-data">' + data.memberships.map(member => 
				`<li>${member.election.name} (${trimPost(member.post.label)}) - ${member.on_behalf_of.name}</li>`).join('') + '</ul>');
	}
	
	function trimPost(postName) {
		return postName.match(/^(Member of (the Scottish )?Parliament for )?(.*?)( ward)?$/)[3];
	}
	
	// Highlight selected option
	$('body').on('change', '.sjo-bulkadd-listitem input[type="radio"]', event => {
		$('.sjo-bulkadd-listitem').each((index, element) =>
			$(element).toggleClass('sjo-bulkadd-selected', $('input[type="radio"]', element).is(':checked')));
	});
	
}
