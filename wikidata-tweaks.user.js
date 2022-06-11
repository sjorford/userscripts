// ==UserScript==
// @name           Wikidata tweaks
// @namespace      sjorford@gmail.com
// @version        2022.06.07.1
// @author         Stuart Orford
// @match          https://www.wikidata.org/wiki/Q*
// @grant          none
// ==/UserScript==

(function () {
	var timer = window.setInterval(function() {
		if (jQuery) {
			window.clearInterval(timer);
			
			var $ = jQuery;
			
			$(`<style>
				
			</style>`).appendTo('head');
			
			$('div.wikibase-sitelinkgroupview:contains("(0 entries)")').hide();
			
		}
	}, 100);
})();
