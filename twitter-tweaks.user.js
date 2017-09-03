// ==UserScript==
// @id          twitter-tweaks@twitter.com@sjorford@gmail.com
// @name        Twitter tweaks
// @namespace   sjorford@gmail.com
// @include     https://twitter.com/*
// @version     2017-05-23
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(`<style>
	
	xxx.has-recap {display: none !important;}
	
	[data-trend-name="Katie Hopkins"],
	[data-trend-name="Piers Morgan"],
	[data-trend-name="Toby Young"],
	[data-trend-name="Tommy Robinson"] {display: none !important;}
	
	.sjo-lists-header {display: block; font-size: 12px; font-weight: bold; color: #657786;}
	.sjo-list-link {font-size: 16px; font-weight: bold; color: #14171a; display: block;}
	.sjo-list-link:hover {color: #0084B4;}
	
</style>`).appendTo('head');

$(function() {

	$(`<div style="padding: 16px;">
		<a class="sjo-lists-header" href="/sjorford/lists">Lists</a>
		<a class="sjo-list-link" href="/sjorford/lists/birding">Birding</a>
		<a class="sjo-list-link" href="/sjorford/lists/democracy">Democracy</a>
		<a class="sjo-list-link" href="/sjorford/lists/random">Random</a>
		<a class="sjo-list-link" href="/sjorford/lists/us-politics">US Politics</a>
	</div>`).insertAfter('.ProfileCardStats');
	
});
