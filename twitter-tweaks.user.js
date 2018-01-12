// ==UserScript==
// @id          twitter-tweaks@twitter.com@sjorford@gmail.com
// @name        Twitter tweaks
// @namespace   sjorford@gmail.com
// @include     https://twitter.com/*
// @version     2018-01-12
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(`<style>
	
	[data-trend-name="Ann Coulter"],
	[data-trend-name="Giles Coren"],
	[data-trend-name="John Humphrys"],
	[data-trend-name="Katie Hopkins"],
	[data-trend-name="Michael Howard"],
	[data-trend-name="Nadine Dorries"],
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
	
	var lists = [
		'Birding',
		'Democracy Club',
		'Demo Club Plus',
		'Late Night',
		'Local councils',
		'Random',
		'US Politics',
	];
	
	addListsModule();
	
	function addListsModule() {
		
		var target = $('.dashboard .module').first();
		if (target.length == 0) {
			setTimeout(addListsModule, 1000);
			return;
		}
		
		var module = $('<div class="flex-module"></div>').insertAfter(target).append('<h3>Lists <small class="view-all">· <a href="/sjorford/lists" data-nav="more_lists" class="js-nav">View all</a></small></h3>');
		$.each(lists, (index, value) => module.append(`<a class="sjo-list-link" href="/sjorford/lists/${value.toLowerCase().replace(/ /g, '-')}">${value}</a>`));
		module.insertAfter(target).wrap('<div class="module"></div>');
		
	}
	
});
