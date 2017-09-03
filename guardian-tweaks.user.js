// ==UserScript==
// @id          guardian-tweaks@theguardian.com@sjorford@gmail.com
// @name        Guardian tweaks
// @namespace   sjorford@gmail.com
// @include     http://www.theguardian.com/*
// @include     https://www.theguardian.com/*
// @version     1.0
// @grant       unsafeWindow
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		#comments {display: none;}
		.live-blog__sticky-components-container.affix {position: static;}
	</style>`).appendTo('head');
	
	$('.fc-item__byline').filter(':contains("Suzanne Moore"), :contains("Zoe Williams")').closest('.fc-item').hide();
	
});
