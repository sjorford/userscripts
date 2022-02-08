// ==UserScript==
// @name           Wikidata tweaks
// @namespace      sjorford@gmail.com
// @version        2022.02.08.0
// @author         Stuart Orford
// @match          https://www.wikidata.org/wiki/Q*
// @grant          none
// ==/UserScript==

//(function($) {
jQuery(function() {
	
	console.log('Wikidata tweaks');
	
	$(`<style>
		
	</style>`).appendTo('head');
	
	$('div.wikibase-sitelinkgroupview:contains("(0 entries)")').hide();
	
});
//})(jQuery.noConflict());
