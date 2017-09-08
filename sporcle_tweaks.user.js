// ==UserScript==
// @name        Sporcle tweaks
// @namespace   sjorford@gmail.com
// @include     http://www.sporcle.com/*
// @include     https://www.sporcle.com/*
// @version     2017-08-02
// @grant       none
// ==/UserScript==

var $ = jQuery;

$(function() {
	
	/*
		.remodal-overlay, .remodal-wrapper, .remodal {xxxdisplay: none !important;}
		.remodal-overlay.pauseScreen {xxxdisplay: block !important;}
		.remodal.pauseScreen {xxxdisplay: inline-block !important;}
		html.remodal-is-locked {xxxoverflow: auto !important; touch-action: auto !important;}
	*/
	
	$(`<style>
		#bg-temp.shifted {margin-top: auto;}
		#leaderboard-wrapper {display: none;}
		.sjo-hint {color: #ccc;}
	</style>`).appendTo('head');
	
	var hints = {
		ultimate_usmetro: ['NY-NJ-PA', 'CA', 'IL-IN-WI', 'TX', 'TX', 'PA-NJ-DE-MD', 'DC-VA-MD-WV', 'FL', 'GA', 'MA-NH', 'CA', 'CA', 'MI', 'AZ', 'WA', 'MN-WI', 'CA', 'FL', 'MO-IL', 'MD', 'CO', 'PA', 'OR-WA', 'TX', 'CA', 'FL', 'OH-KY-IN', 'OH', 'MO-KS', 'NV', 'CA', 'OH', 'NC-SC', 'TX', 'IN', 'VA-NC', 'TN', 'RI-MA', 'WI', 'FL', 'TN-MS-AR', 'KY-IN', 'OK', 'VA', 'CT', 'LA', 'NC', 'UT', 'NY', 'AL', 'NY', 'AZ', 'HI', 'OK', 'CA', 'CT', 'NM', 'NE-IA', 'NY', 'CT', 'CA', 'OH', 'CA', 'PA-NJ', 'TX', 'LA', 'MA', 'TX', 'MI', 'SC', 'NC', 'AR', 'FL', 'TN', 'OH', 'CA', 'MA', 'SC', 'NY', 'NY', 'CO', 'OH', 'SC', 'FL', 'ID', 'KS', 'FL', 'IA', 'WI', 'PA', 'OH-PA', 'GA-SC', 'UT', 'PA', 'MS', 'FL', 'UT', 'TN-GA', 'PA', 'CA', 'ME', 'NC', 'FL', 'CA', 'NC', 'KY', 'AR-MO', 'WA', 'MI', 'FL', 'CA', 'MO', 'PA', 'TX', 'NV', 'NC', 'FL', 'CA', 'AL', 'MI', 'CA', 'IN', 'CA', 'TX', 'PA', 'AL', 'TX', 'OH', 'LA', 'NH', 'OR', 'TX', 'AK', 'IA-IL', 'IL', 'AL', 'NC', 'FL', 'NC', 'NJ', 'NC', 'IN-KY', 'GA', 'OR', 'IL', 'MI', 'FL', 'MI', 'FL', 'IN-MI', 'TN-VA', 'WI', 'VA', 'NE', 'CO', 'WV', 'GA-AL', 'AR-OK', 'CO', 'NY', 'TX', 'WV-KY-OH', 'SC', 'PA', 'MN-WI', 'TN-KY', 'LA', 'SC', 'NJ', 'CT', 'CA', 'MD-WV', 'FL', 'MI', 'CA', 'WA', 'IA', 'CA', 'CO', 'WA', 'TX', 'WA', 'VA', 'TX', 'MS', 'NY', 'WA', 'TX', 'KS', 'GA', 'SD', 'IL', 'TX', 'WI', 'AL', 'CA', 'TX', 'MA', 'NM', 'TX']
	};
	
	var gameKey = window.location.href.split('/').slice(-1);
	console.log(gameKey);
	if (hints[gameKey]) {
		$('.d_value').each((index, element) => $(`<span class="sjo-hint">${hints[gameKey][index]}</span>`).appendTo(element));
	}
	
	$('body').on('keypress', '#gameinput', event => {
		if (event.originalEvent.key === 'ArrowDown' ? $('#nextButton').click() : event.originalEvent.key === 'ArrowUp' ? $('#previousButton').click() : '');
	});
	
});
