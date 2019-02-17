// ==UserScript==
// @name        Twitter tweaks
// @namespace   sjorford@gmail.com
// @include     https://twitter.com/*
// @version     2019.02.17.1
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
	
</style>`).appendTo('head');

$(function() {
	
	// Strip search parameters
	if (window.location.search.match(/^\?(lang=en(-gb)?$|ref_src=)/)) window.location = window.location.href.split('?')[0];
	
	// Hotkey for search box
	$('body').on('keydown', event => {
		var oe = event.originalEvent;
		if (oe.shiftKey && oe.altKey && !oe.ctrlKey && oe.key == 'F') {
			$('#search-query').focus().select();
			event.preventDefault();
		}
	});
	
});
