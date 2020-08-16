// ==UserScript==
// @name           Legislation.gov.uk tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2020.08.16.0
// @match          https://www.legislation.gov.uk/*
// @grant          none
// ==/UserScript==

$(function() {
	
	// Repopulate search boxes
	var pageTitle = $('#pageTitle').text().trim();
	if (['Search Results', 'Page Not Found'].indexOf(pageTitle) >= 0) {
		
		var type, year, number, title;
		var pathParts = window.location.pathname.split('/');
		
		if (pathParts[1].match(/^\d{4}$/)) {
			year   = year   || pathParts[1];
			number = number || pathParts[2];
		} else if (pathParts[1] != 'search') {
			type   = type   || pathParts[1];
			year   = year   || pathParts[2];
			number = number || pathParts[3];
		}
		
		if (window.location.search) {
			var params = new URLSearchParams(window.location.search.substring(1));
			type   = type   || params.get('type');
			title  = title  || params.get('title');
			year   = year   || params.get('year');
			number = number || params.get('number');
		}
		
		$('#type').val(type);
		$('#title').val(title);
		$('#year').val(year);
		$('#number').val(number);
		
		// Highlight ECOs
		$('<style>.sjo-electoral td {background-color: #ffc35bb3 !important;}</style>').appendTo('head');
		$('#content tr:contains("Elect")').addClass('sjo-electoral');
		
		// Direct SI links to whole instrument
		$('a[href*="/uksi/"]').attr('href', (i,href) => href.replace(/\/contents\//, '/'));
		
	}
	
});
