// ==UserScript==
// @name         Guardian football tweaks
// @namespace    sjorford@gmail.com
// @version      2020.02.27.0
// @author       Stuart Orford
// @match        https://www.theguardian.com/football/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

$(function() {
	
	$(`<style class-"sjo-styles">
		.sjo-table-links a {font-weight: normal; margin-left: 0.5em;}
		@media (min-width: 71.25em) {
			.sjo-table-links a {display: block; margin-top: 0.5em; margin-left: 0;}
		}
	</style>`).appendTo('head');
	
	if (window.location.pathname.match('/table')) {
		$(`<span class="sjo-table-links">
			<a href="${window.location.pathname.replace('/table', '/fixtures')}">Fixtures</a>
			<a href="${window.location.pathname.replace('/table', '/results')}">Results</a>
		</span>`).appendTo('.table--football caption');
	}
	
	if (window.location.pathname.match(/football\/.*\/fixtures/)) {
		$(`<div>
			<a href="${window.location.pathname.replace('/fixtures', '/table')}">Table</a>
			<a href="${window.location.pathname.replace('/fixtures', '/results')}">Results</a>
		</div>`).appendTo('.football-leagues');
		
	}
	
	
	
	
	
});
