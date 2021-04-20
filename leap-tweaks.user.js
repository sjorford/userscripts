// ==UserScript==
// @name           LEAP tweaks
// @namespace      sjorford@gmail.com
// @version        2021.04.20.0
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
	</style>`).appendTo('head');
	
});
})(jQuery.noConflict());
