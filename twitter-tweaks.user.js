// ==UserScript==
// @name        Twitter tweaks
// @namespace   sjorford@gmail.com
// @include     https://twitter.com/*
// @version     2018.10.31.0
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js
// ==/UserScript==

$(`<style>
	
	.sjo-list-link {display: block; margin-bottom: 0.25em; font-size: 14px; font-weight: bold; color: #14171a;}
	.sjo-list-link:hover {color: #0084B4;}
	.component[data-component-context="more_lists"] {display: none;}
	
	.StickersMediaImage-stickerLink {display: none;}

	.tweet.muting {display: none;}
	
	.wtf-module {display: none !important;}
	.module.trends {display: none !important;}
	
	.sjo-botuser * {display: none !important;}
	
</style>`).appendTo('head');

$(function() {
	
	// Strip search parameters
	if (window.location.search.match(/^\?(lang=en(-gb)?$|ref_src=)/)) window.location = window.location.href.split('?')[0];
	
	// Hide bots
	function hide12345678() {
		$('li').not('.sjo-botuser').find('a.account-group').filter((i,e) => e.href.match(/\d{8}$/)).closest('li').addClass('sjo-botuser');
	}
	window.setInterval(hide12345678, 50);
	
});
