// ==UserScript==
// @id          guardian-tweaks@theguardian.com@sjorford@gmail.com
// @name        Guardian tweaks
// @namespace   sjorford@gmail.com
// @include     http://www.theguardian.com/*
// @include     https://www.theguardian.com/*
// @version     2018.05.09.0
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		#comments {display: none;}
		.live-blog__sticky-components-container.affix {position: static;}
		.weather {display: none;}
	</style>`).appendTo('head');
	
	$('.fc-item__byline, .fc-item__kicker').filter(`
		:contains("Suzanne Moore"), 
		:contains("Zoe Williams"), 
		:contains("Germaine Greer"), 
		:contains("Tim Dowling")`).closest('.fc-item').hide();
	
});
