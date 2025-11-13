// ==UserScript==
// @name           Legislation.gov.uk tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2025.11.13.0
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
	var type = window.location.pathname.match(/[^\/]+/)[0];
	$('select#type').val(type);
	
	// Open options menus
	$('.expandCollapseLink:not(.close)').click();
	
});
