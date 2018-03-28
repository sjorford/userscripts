// ==UserScript==
// @name        Twitter tweaks
// @namespace   sjorford@gmail.com
// @include     https://twitter.com/*
// @version     2018.03.28.0
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
	[data-trend-name="Peter Hitchens"],
	[data-trend-name="Piers Morgan"],
	[data-trend-name="Priti Patel"],
	[data-trend-name="Sean Penn"],
	[data-trend-name="Toby Young"],
	[data-trend-name="Tommy Robinson"] {display: none !important;}
	
	.sjo-list-link {display: block; margin-bottom: 0.25em; font-size: 14px; font-weight: bold; color: #14171a;}
	.sjo-list-link:hover {color: #0084B4;}
	.component[data-component-context="more_lists"] {display: none;}
	
	.StickersMediaImage-stickerLink {display: none;}
	
	li[data-suggestion-json*="ActivityTweet"] {display: none;}
	
</style>`).appendTo('head');

$(function() {
	
	var dateFormatString = 'YYYY-MM-DD HH:mm:ss';
	var target;
	var lists;
	
	// TODO: keep this running so that it reloads when internal links rewrite the page?
	//checkForDashboard();
	
	function checkForDashboard() {
		
		target = $('.dashboard .module');
		if (target.length == 0) {
			setTimeout(checkForDashboard, 1000);
		} else {
			getListOfLists();
		}
		
	}
	
	function getListOfLists() {
		
		lists = localStorage.getItem('sjo-twitter-lists');
		var lastChecked = localStorage.getItem('sjo-twitter-lists-update');
		if (!lists || !lastChecked || moment(lastChecked, dateFormatString).isBefore(moment().subtract(1, 'days'))) {
			refreshLists();
		} else {
			lists = JSON.parse(lists);
			addListsModule();
		}
		
	}
	
	function refreshLists() {
		
		console.log('refreshing list of lists');
		$.get('https://twitter.com/sjorford/lists/', data => {
			lists = [];
			var regex = /<a class="[^"]*ProfileListItem-name[^"]*"[^<]*href="\/[^\/]+\/lists\/[^"]+">([^"]+)<\/a>/g;
			var matches;
			while (matches = regex.exec(data)) {
				lists.push(matches[1]);
			}
			console.log('lists found:' + lists.join(', '));
			localStorage.setItem('sjo-twitter-lists', JSON.stringify(lists));
			localStorage.setItem('sjo-twitter-lists-update', moment().format(dateFormatString));
			addListsModule();
		});
		
	}
	
	function addListsModule() {
		
		var module = $('<div class="module"></div>').insertAfter(target.first());
		var flexModule = $('<div class="flex-module"></div>').appendTo(module);
		var flexModuleHeader = $('<div class="flex-module-header"></div>').appendTo(flexModule)
			.append('<h3>Lists</h3>')
			.append('<small> · <button type="button" class="btn-link sjo-lists-refresh">Refresh</button></small>')
			.append('<small> · <a href="/sjorford/lists/">View all</a></small>');
		var flexModuleInner = $('<div class="flex-module-inner"></div>').appendTo(flexModule);
		
		$.each(lists.sort((a, b) => a > b), (index, value) => {
			flexModuleInner.append(`<a class="sjo-list-link" href="/sjorford/lists/${value.toLowerCase().replace(/ /g, '-')}">${value}</a>`);
		});
		
		$('#sjo-lists-refresh').click(() => {
			refreshLists();
			return false;
		});
		
	}
	
});
