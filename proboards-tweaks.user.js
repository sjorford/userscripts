// ==UserScript==
// @name        Proboards tweaks
// @namespace   sjorford@gmail.com
// @include     http://vote-2012.proboards.com/*
// @include     https://vote-2012.proboards.com/*
// @version     2022.03.30.0
// @grant       none
// ==/UserScript==

$(function() {
	
	$(`<style>
		
		div[id$="-banner"],
		div[id$="-overlay"],
		div#support-message,
		div.c-pb-plus__container
			{display: none !important;}
		
		body {
			overflow: auto !important;
			position: revert !important;
		}
		
		tr.bookmarked.new {background-color: #ffd700b3 !important;}
		tr.new            {background-color: #ffd70066 !important;}
		
		.message br {margin-bottom: 0.5em;}
		
		.post .content article h3.title {display: none;}
		
		.posts .post .left-panel {display: block; width: 100%;}
		.posts .post .content {display: block;}
		.mini-profile {padding: 0 10px; border: 0 !important; width: 100%;}
		.mini-profile .info {display: inline-block; margin-left: 1em;}
		.mini-profile br {display: none;}
		.o-user-link {margin-right: 1em;}
		.info > .italic {margin-left: 1em;}
		
	</style>`).appendTo('head');
	
	$('li.ui-pagination-page a').click(event => {
		event.preventDefault();
		window.location = event.target.href;
		return false;
	});
	
});
