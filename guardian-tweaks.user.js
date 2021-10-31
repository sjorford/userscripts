// ==UserScript==
// @id          guardian-tweaks@theguardian.com@sjorford@gmail.com
// @name        Guardian tweaks
// @namespace   sjorford@gmail.com
// @include     http://www.theguardian.com/*
// @include     https://www.theguardian.com/*
// @version     2021.10.31.0
// @grant       none
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		
		#comments {display: none;}
		.live-blog__sticky-components-container.affix {position: static;}
		.weather {display: none;}
		
		@media (min-width: 81.25em) {
			.crossword__spacer--ad {margin-right: 0;}
			.crossword__clues {display: block; column-count: 3;}
			.crossword__clues--across, .crossword__clues--down {display: block; padding-left: 0;}
		}
		
	</style>`).appendTo('head');
	
});
