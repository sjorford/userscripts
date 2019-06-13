// ==UserScript==
// @name           Sporcle tweaks
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @version        2019.06.13.0
// @match          https://www.sporcle.com/games/ateweston85/european-cup--champions-league-semi-finalists
// @grant          none
// ==/UserScript==

jQuery(function() {
	
	var $ = jQuery;
	
	var functionMap = {
		'/games/ateweston85/european-cup--champions-league-semi-finalists': [moreColumns, blackOnWhite],
	};
	
	$.each(functionMap, (key, fn) => {if (window.location.href.indexOf(key)) {Array.isArray(fn) ? $.each(fn, (i, f) => f.call()) : fn.call()}});
	
	// Widen the play area and double the number of columns
	function moreColumns() {
		$(`<style>#page-wrapper {width: auto;}</style>`).appendTo('head');
		$('#gameTable > tbody > tr:nth-of-type(2n)').each((index, element) => $(element).prev('tr').append(element.cells));
	}
	
	// Default colours
	function blackOnWhite() {
		$(`<style>td.d_value {color: black; background-color: white; border-bottom: 1px solid black;}</style>`).appendTo('head');
	}
	
	/*
	
	$(`<style>
		#bg-temp.shifted {margin-top: auto;}
		#leaderboard-wrapper {display: none;}
		.sjo-hint {color: #bbb;}
	</style>`).appendTo('head');
	
	var hints = {
		ultimate_usmetro:
			['NY-NJ-PA', 'CA', 'IL-IN-WI', 'TX', 'TX', 'PA-NJ-DE-MD', 'DC-VA-MD-WV', 'FL', 'GA', 'MA-NH', 'CA', 'CA', 'MI', 'AZ', 'WA', 'MN-WI', 'CA', 'FL', 'MO-IL', 'MD', 'CO', 'PA', 'OR-WA', 'TX', 'CA', 'FL', 'OH-KY-IN', 'OH', 'MO-KS', 'NV', 'CA', 'OH', 'NC-SC', 'TX', 'IN', 'VA-NC', 'TN', 'RI-MA', 'WI', 'FL', 'TN-MS-AR', 'KY-IN', 'OK', 'VA', 'CT', 'LA', 'NC', 'UT', 'NY', 'AL', 'NY', 'AZ', 'HI', 'OK', 'CA', 'CT', 'NM', 'NE-IA', 'NY', 'CT', 'CA', 'OH', 'CA', 'PA-NJ', 'TX', 'LA', 'MA', 'TX', 'MI', 'SC', 'NC', 'AR', 'FL', 'TN', 'OH', 'CA', 'MA', 'SC', 'NY', 'NY', 'CO', 'OH', 'SC', 'FL', 'ID', 'KS', 'FL', 'IA', 'WI', 'PA', 'OH-PA', 'GA-SC', 'UT', 'PA', 'MS', 'FL', 'UT', 'TN-GA', 'PA', 'CA', 'ME', 'NC', 'FL', 'CA', 'NC', 'KY', 'AR-MO', 'WA', 'MI', 'FL', 'CA', 'MO', 'PA', 'TX', 'NV', 'NC', 'FL', 'CA', 'AL', 'MI', 'CA', 'IN', 'CA', 'TX', 'PA', 'AL', 'TX', 'OH', 'LA', 'NH', 'OR', 'TX', 'AK', 'IA-IL', 'IL', 'AL', 'NC', 'FL', 'NC', 'NJ', 'NC', 'IN-KY', 'GA', 'OR', 'IL', 'MI', 'FL', 'MI', 'FL', 'IN-MI', 'TN-VA', 'WI', 'VA', 'NE', 'CO', 'WV', 'GA-AL', 'AR-OK', 'CO', 'NY', 'TX', 'WV-KY-OH', 'SC', 'PA', 'MN-WI', 'TN-KY', 'LA', 'SC', 'NJ', 'CT', 'CA', 'MD-WV', 'FL', 'MI', 'CA', 'WA', 'IA', 'CA', 'CO', 'WA', 'TX', 'WA', 'VA', 'TX', 'MS', 'NY', 'WA', 'TX', 'KS', 'GA', 'SD', 'IL', 'TX', 'WI', 'AL', 'CA', 'TX', 'MA', 'NM', 'TX'],
		us_cities_official_2010_population:
			['NY', 'CA', 'IL', 'TX', 'PA', 'AZ', 'TX', 'CA', 'TX', 'CA', 'FL', 'IN', 'CA', 'TX', 'OH', 'TX', 'NC', 'MI', 'TX', 'TN', 'MD', 'MA', 'WA', 'DC', 'TN', 'CO', 'KY', 'WI', 'OR', 'NV', 'OK', 'NM', 'AZ', 'CA', 'CA', 'CA', 'MO', 'AZ', 'VA', 'GA', 'CO', 'NE', 'NC', 'FL', 'OH', 'OK', 'CA', 'HI', 'MN', 'KS', 'TX', 'CA', 'LA', 'CA', 'FL', 'CO', 'CA', 'MO', 'PA', 'TX', 'CA', 'OH', 'KY', 'AK', 'CA', 'OH', 'MN', 'NJ', 'NC', 'NY', 'TX', 'NE', 'NV', 'IN', 'NJ', 'FL', 'CA', 'VA', 'FL', 'AZ', 'TX', 'WI', 'NC', 'TX', 'LA', 'NC', 'TX', 'AZ', 'NV', 'FL', 'VA', 'AZ', 'NV', 'TX', 'CA', 'CA', 'AL', 'NY', 'CA', 'WA', 'AZ', 'VA', 'AL', 'ID', 'VA', 'IA', 'CA', 'NC', 'LA', 'OH', 'WA', 'IL', 'CA', 'CA', 'NY', 'GA', 'AL', 'AR', 'CA', 'CA', 'TX', 'CA', 'GA', 'MI', 'UT', 'FL', 'MA', 'VA', 'AL', 'TN', 'RI', 'CA', 'TX', 'TX', 'MS', 'KS', 'CA', 'CA', 'TN', 'CA', 'FL', 'CA', 'FL', 'CA', 'WA', 'AZ', 'MO', 'CA', 'OR', 'FL', 'OR', 'FL', 'AZ', 'SD', 'MA', 'CA', 'IL', 'CA', 'CA', 'CA', 'CA', 'TX', 'IL', 'NJ', 'KS', 'CA', 'NY', 'CT', 'CA', 'CO', 'CA', 'CO', 'IL', 'OH', 'FL', 'CA', 'VA', 'TX', 'VA', 'CA', 'CA', 'GA', 'NC', 'CA', 'MI', 'TN', 'TX', 'TX', 'CT', 'MI', 'UT', 'SC', 'TX', 'KS', 'CA', 'IA', 'KS', 'NJ', 'TX', 'CT'],
	};
	
	var gameKey = window.location.href.split('/').slice(-1)[0].replace(/-/g, '_');
	console.log(gameKey);
	if (hints[gameKey]) {
		$('.d_value').each((index, element) => $(`<span class="sjo-hint">${hints[gameKey][index]}</span>`).appendTo(element));
	}
	
	$('body').on('keypress', '#gameinput', event => {
		if (event.originalEvent.key === 'ArrowDown' ? $('#nextButton').click() : event.originalEvent.key === 'ArrowUp' ? $('#previousButton').click() : '');
	});
	
	*/
	
});
