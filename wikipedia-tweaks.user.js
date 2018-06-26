// ==UserScript==
// @id             wikipedia-tweaks@wikipedia.org@sjorford@gmail.com
// @name           Wikipedia tweaks
// @version        2018.06.26.0
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
	
});
