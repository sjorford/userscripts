// ==UserScript==
// @name           Wikidata tweaks
// @namespace      sjorford@gmail.com
// @version        2023.09.16.0
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
				#P6465 div, #P6465 span {background-color: #ffe65e !important;}
			</style>`).appendTo('head');
			
			$('div.wikibase-sitelinkgroupview:contains("(0 entries)")').hide();
			
		}
	}, 100);
})();
