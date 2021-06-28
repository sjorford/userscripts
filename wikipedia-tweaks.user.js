// ==UserScript==
// @id             wikipedia-tweaks@wikipedia.org@sjorford@gmail.com
// @name           Wikipedia tweaks
// @version        2021.06.28.0
// @namespace      sjorford@gmail.com
// @author         Stuart Orford
// @include        https://en.wikipedia.org/*
// @run-at         document-end
// @grant          none
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// ==/UserScript==

$(function() {
	
	console.log('Wikipedia tweaks');
		
	$(`<style>
		
		/* th > div.plainlinks.hlist.navbar.mini {display: none;} */
		#pt-userpage, #pt-mytalk, #pt-sandbox, #pt-mycontris, #pt-watchlist {display: none;}
		/* #mw-page-header-links, .mw-editsection {display: none;} */
		/* .navbar-mini {display: none !important;} */
		
		#ca-history a {
			text-indent: inherit;
			width: auto;
			padding: 0 2px 0 20px;
		}
		
		/* bug in Timeless skin? */
		.toccolours {display: table-cell;}
		
	</style>`).appendTo('head');
	
	// Hide long references lists
	$('.reflist').each((index, reflist) => {
		if ($('li', reflist).length > 50) {
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
	
	var wikidataLink = $('#t-wikibase a');
	var wikidataID;
	if (wikidataLink.length > 0) {
		wikidataID = wikidataLink.attr('href').match(/Q\d+/)[0];
		wikidataLink.text('Wikidata ' + wikidataID);
	}
	
});
