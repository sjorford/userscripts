// ==UserScript==
// @name           Legislation.gov.uk tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2025.11.20.0
// @match          https://www.legislation.gov.uk/*
// @grant          none
// ==/UserScript==

$(function() {
	
	$(`<style>
		.sjo-collapsed {display: none;}
	</style>`).appendTo('head');
	
	$('p.LegAnnotationsGroupHeading').each((i,e) => {
		console.log(i, e);
		var heading = $(e);
		var annotations = heading.nextUntil('p').wrapAll(`<div class="sjo-collapsible sjo-collapsed" id="sjo-collapsible-${i}"></div>`);
		heading.click(event => {
			$(`#sjo-collapsible-${i}`).toggleClass('sjo-collapsed');
		});
	});
	
	// Refill search boxes
	var parts = window.location.pathname.replace(/^\//, '').split('/');
	if (parts[0]) $('select#type').val(parts[0]);
	if (parts[1] && parts[1] != '*') $('input#year').val(parts[1]);
	if (parts[2]) $('input#number').val(parts[2]);
	var params = new URLSearchParams(window.location.search);
	params.forEach((val, key) => $('input#' + key).val(val));
	
	// Open options menus
	$('#openingOptions .expandCollapseLink:not(.close)').click();
	
});
