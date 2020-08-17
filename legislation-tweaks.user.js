﻿// ==UserScript==
// @name           Legislation.gov.uk tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2020.08.17.2
// @match          https://www.legislation.gov.uk/*
// @grant          none
// ==/UserScript==

$(function() {
	
	$(`<style>
		.sjo-highlight {background-color: #ffd700a3 !important;}
		.sjo-electoral td {background-color: #ffc35bb3 !important;}
	</style>`).appendTo('head');

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
		$('#content tr:contains("Elect")').addClass('sjo-electoral');
		
		// Direct SI links to whole instrument
		$('a').filter((i,e) => e.href.match(/\/(uksi|ssi|wsi)\//)).attr('href', (i,href) => href.replace(/\/contents\//, '/'));
		
	}
	
	$('#viewLegSnippet *').contents().filter((i,e) => e.nodeType == 3).each((i,e) => {
		var match;
		while (match = e.nodeValue.match(/^(.*?)(?<!\d)(\d{4}|(\d+|(\w+ty)(-(nine|eight|seven|six|five|four|three|two|one))?|nine|eight|seven|six|five|\w+teen\b|ten|eleven|twelve|oodles) ((county|district) )?(electoral )?(wards|divisions)|is (\d|one|two|three|four|five|six))(?!\d)(.*)$/s)) {
			var before = document.createTextNode(match[1]);
			var after  = document.createTextNode(match[match.length - 1]);
			$('<span class="sjo-highlight"></span>').text(match[2]).insertAfter(e).before(before).after(after);
			e.remove();
			e = after;
		}
	});
	
	$('.LegTable').each((i,e) => {
		var table = $(e);
		var total = table.find('*').not(':has(*)').filter((i,e) => e.innerText.trim().match(/^\d$/))
							.toArray().reduce((Σ,e) => Σ += (e.innerText - 0), 0);
		table.before(`Total: <span class="sjo-highlight">${total}</span>`);
	});
	
});
