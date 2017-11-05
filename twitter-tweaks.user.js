// ==UserScript==
// @id          twitter-tweaks@twitter.com@sjorford@gmail.com
// @name        Twitter tweaks
// @namespace   sjorford@gmail.com
// @include     https://twitter.com/*
// @version     2017-09-22
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(`<style>
	
	xxx.has-recap {display: none !important;}
	
	[data-trend-name="Katie Hopkins"],
	[data-trend-name="Peter Hitchens"],
	[data-trend-name="Piers Morgan"],
	[data-trend-name="Toby Young"],
	[data-trend-name="Tommy Robinson"] {display: none !important;}
	
	.sjo-lists-header {display: block; color: #657786;}
	.sjo-list-link {display: block; padding-top: 0.25em; font-size: 16px; font-weight: bold; color: #14171a;}
	.sjo-list-link:hover {color: #0084B4;}
	.component[data-component-context="more_lists"] {display: none;}
	
</style>`).appendTo('head');

$(function() {
	
	addListsModule();
	
	function addListsModule() {
		
		var listsModule = $('#sjo-lists-module');
		if (listsModule.length == 0) {
			
			listsModule = $(`<div class="module" id="sjo-lists-module"><div class="flex-module">
				<h3>Lists <small class="view-all">· <a href="/sjorford/lists" data-nav="more_lists" class="js-nav">View all</a></small></h3>
				<a class="sjo-list-link" href="/sjorford/lists/birding">Birding</a>
				<a class="sjo-list-link" href="/sjorford/lists/democracy">Democracy</a>
				<a class="sjo-list-link" href="/sjorford/lists/demo-club-plus">Demo Club Plus</a>
				<a class="sjo-list-link" href="/sjorford/lists/random">Random</a>
				<a class="sjo-list-link" href="/sjorford/lists/us-politics">US Politics</a>
			</div></div>`);
			$('.dashboard .module').first().after(listsModule);
			
		}
		
		setTimeout(addListsModule, 1000);
	}
	
});
