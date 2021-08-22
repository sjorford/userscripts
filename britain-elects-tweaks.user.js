// ==UserScript==
// @name           Britain Elects tweaks
// @namespace      sjorford@gmail.com
// @version        2021.08.22.1
// @author         Stuart Orford
// @match          http://www.britainelects.com/author/andrewteale/*
// @grant          none
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-links {padding: 2em;}
		.sjo-links a {margin-right: 2em;}
	</style>`).appendTo('head');
	
	var baseUrl = window.location.href;
	var pageNo = 1;
	var urlMatch = window.location.href.match(/^(.+?\/)page\/(\d+)/);
	if (urlMatch) {
		baseUrl = urlMatch[1];
		pageNo = urlMatch[2] - 0;
	}
	
	var wrapper = $('<div class="sjo-links"></div>').insertAfter('.page-body');
	
	if (pageNo > 1)
		$(`<a href="${baseUrl}page/${pageNo - 1}">Previous page</a>`).appendTo(wrapper);
		$(`<a href="${baseUrl}page/${pageNo + 1}">Next page</a>`).appendTo(wrapper);
	
});
})(jQuery.noConflict());
