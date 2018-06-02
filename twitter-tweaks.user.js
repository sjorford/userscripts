// ==UserScript==
// @name        Twitter tweaks
// @namespace   sjorford@gmail.com
// @include     https://twitter.com/*
// @version     2018.06.02.0
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.20.1/moment.min.js
// ==/UserScript==

$(`<style>
	
	[data-trend-name="Ann Coulter"],
	[data-trend-name="Brendan O'Neill"],
	[data-trend-name="Giles Coren"],
	[data-trend-name="Jeremy Clarkson"],
	[data-trend-name="John Humphrys"],
	[data-trend-name="Katie Hopkins"],
	[data-trend-name="Michael Howard"],
	[data-trend-name="Nadine Dorries"],
	[data-trend-name="Owen Jones"],
	[data-trend-name="Peter Hitchens"],
	[data-trend-name="Piers Morgan"],
	[data-trend-name="Priti Patel"],
	[data-trend-name="Sean Penn"],
	[data-trend-name="Ted Nugent"],
	[data-trend-name="Toby Young"],
	[data-trend-name="Tommy Robinson"] {display: none !important;}
	
	.sjo-list-link {display: block; margin-bottom: 0.25em; font-size: 14px; font-weight: bold; color: #14171a;}
	.sjo-list-link:hover {color: #0084B4;}
	.component[data-component-context="more_lists"] {display: none;}
	
	.StickersMediaImage-stickerLink {display: none;}

	li[data-suggestion-json*="ActivityTweet"] {display: none;}

	.tweet.muting {display: none;}
	
	.wtf-module {display: none !important;}
	.module.trends {display: none !important;}
	
</style>`).appendTo('head');

$(function() {
	
});
