// ==UserScript==
// @name           LEAP tweaks
// @namespace      sjorford@gmail.com
// @version        2024.06.27.0
// @author         Stuart Orford
// @match          http://www.andrewteale.me.uk/leap/results/*
// @match          https://www.andrewteale.me.uk/leap/results/*
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.nav_thiscouncil {border-left: 1px solid black;}
		.nav_thiscouncil li {
			background-color: white !important; 
			border-left: 8px solid darkgray;
			padding: 0 3px;
		}
		.nav_thiscouncil li a {
			text-decoration: none;
			color: black !important;
		}
		.C   {border-left-color: blue !important;}
		.Lab {border-left-color: red  !important;}
		.LD  {border-left-color: gold !important;}
		.sjo-current-page {background-color: gold;}
	</style>`).appendTo('head');
	
	// Navigation
	var wrapper = $('<div style="margin-top: 1em;"></div>').insertBefore('h1');
	var current = $('a').filter((i,e) => e.href == window.location.href).closest('li').addClass('sjo-current-page');
	var prev = current.prev();
	var next = current.next();
	var prevURL = prev.find('a').attr('href');
	var nextURL = next.find('a').attr('href');
	if (prevURL) wrapper.append(`<a href="${prevURL}">${prev.text()}</a> < `);
	wrapper.append(`<strong>${current.text()}</strong>`);
	if (nextURL) wrapper.append(` < <a href="${nextURL}">${next.text()}</a>`);
	
});
})(jQuery.noConflict());
