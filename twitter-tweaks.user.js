// ==UserScript==
// @name        Twitter tweaks
// @namespace   sjorford@gmail.com
// @include     https://twitter.com/*
// @include     https://mobile.twitter.com/*
// @version     2023.08.14.0
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
	
	.sjo-hide {display: none !important;}
	
	xxxa[href$="analytics"] {display: none;}
	
</style>`).appendTo('head');

$(function() {
	
	// Strip search parameters
	if (window.location.search.match(/^\?(lang=en(-gb)?$|ref_src=|t=)/i)) window.location = window.location.href.split('?')[0];
	
	// Hotkey for search box
	$('body').on('keydown', event => {
		var oe = event.originalEvent;
		if (oe.shiftKey && oe.altKey && !oe.ctrlKey && oe.key == 'F') {
			$('#search-query').focus().select();
			event.preventDefault();
		}
	});
	
	var minDelay = 50;
	var maxDelay = 500;
	var delay = minDelay;
	var timer = window.setInterval(notInterested, delay);
	
	function notInterested() {
		
		var hot = false;
		
		// no longer works
		var button = $('[id^="topic-not-interested-button"]').first();
		if (button.length > 0) {
			button.click();
			hot = true;
		}
		
		var moreTweets = $('div[data-testid="cellInnerDiv"]').has('span:contains("More Tweets"), span:contains("Related Tweets"), span:contains("Discover more")')
				.nextAll().addBack().not('.sjo-hide');
		if (moreTweets.length > 0) {
			moreTweets.addClass('sjo-hide');
			hot = true;
		}
		
		if (hot) {
			delay = minDelay;
			window.clearInterval(timer);
			timer = window.setInterval(notInterested, delay);
		} else if (delay < maxDelay) {
			delay = delay * 2;
			window.clearInterval(timer);
			timer = window.setInterval(notInterested, delay);
		}
		
	}
	
});
