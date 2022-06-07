// ==UserScript==
// @name           Wikidata tweaks
// @namespace      sjorford@gmail.com
// @version        2022.06.07.0
// @author         Stuart Orford
// @match          https://www.wikidata.org/wiki/Q*
// @grant          none
// ==/UserScript==

jQuery(function() {
	
	var $ = jQuery;
	
	$(`<style>
		
	</style>`).appendTo('head');
	
	$('div.wikibase-sitelinkgroupview:contains("(0 entries)")').hide();
	
});
