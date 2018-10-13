// ==UserScript==
// @id             wikipedia-tweaks@wikipedia.org@sjorford@gmail.com
// @name           Wikipedia tweaks
// @version        2018.10.13.0
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @include        https://en.wikipedia.org/*
// @run-at         document-end
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	$(`<style>
		
		.flagicon {position: relative;}
		.flagicon.sjo-flagicon-ENG::before {
			content: "ENG";
			position: absolute;
			top: -8px;
			width: 23px;
			text-align: center;
			font-size: 5pt;
			font-weight: bold;
		}
		
		.sjo-titlelink {font-size: small;}
		.sjo-titlelink::before {content: " •";}
		.sjo-titlelink:first-of-type::before {content: ""; padding-left: 2rem;}

	</style>`).appendTo('head');
	
	//$('.flagicon:has(img[alt="England"])').addClass('sjo-flagicon-ENG');
	
	// Hide long references lists
	$('.reflist').each((index, reflist) => {
		//console.log('reflist', reflist);
		if ($('li', reflist).length > 20) {
			$(reflist).hide();
			var wrapper = $('<span class="sjo-reflist-wrapper"></span>').insertBefore(reflist);
			$(`<a class="sjo-reflist-button sjo-reflist-button-expand sjo-reflist-button-${index}">[Expand]</a>`).appendTo(wrapper);
			$(`<a class="sjo-reflist-button sjo-reflist-button-collapse sjo-reflist-button-${index}">[Collapse]</a>`).appendTo(wrapper).hide();
		}
	});
	
	$('.sjo-reflist-button').click(event => {
		var wrapper = $(event.target).closest('.sjo-reflist-wrapper');
		wrapper.find('.sjo-reflist-button').toggle();
		wrapper.next('.reflist').toggle();
	});
	
	$('.reference a').click(() => {
		$('.reflist').show();
		$('.sjo-reflist-button-expand').hide();
		$('.sjo-reflist-button-collapse').show();
	});
	
	var pageRegex = /\/wiki\/(.*_)([A-Z])$/;
	var pages = [];
	var titleMatch = window.location.pathname.match(pageRegex);
	if (titleMatch) {
		$('a').each((i,e) => {
			var linkMatch = e.href.match(pageRegex);
			if (linkMatch && linkMatch[1] == titleMatch[1] && pages.indexOf(e.href) < 0) {
				pages.push(e.href);
			}
		});
	}
	if (pages.length > 0) {
		$.each(pages.sort(), (i,e) => {
			$(`<span class="sjo-titlelink"> <a href="${e}">${e.match(pageRegex)[2]}</a></span>`).appendTo('#firstHeading');
		});
	}
	
});
