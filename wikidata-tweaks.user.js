// ==UserScript==
// @name           Wikidata tweaks
// @namespace      sjorford@gmail.com
// @version        2024.07.05.0
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
				#sjo-wikipedia a {
					background-image: url(//upload.wikimedia.org/wikipedia/commons/thumb/6/63/Wikipedia-logo.png/35px-Wikipedia-logo.png);
					background-size: 20px;
					padding-left: 23px;
				}
			</style>`).appendTo('head');
			
			$('div.wikibase-sitelinkgroupview:contains("(0 entries)")').not(':contains("Wikipedia")').hide();
			
			var enwiki = $('.wikibase-sitelinkview-enwiki a');
			if (enwiki.length > 0) {
				$(`<li id="sjo-wikipedia" class="mw-list-item"><a href="${enwiki.attr('href')}" title="${enwiki.text()}"><span>${enwiki.text()}</span></a></li>`)
					.insertAfter('#ca-talk');
			}
			
		}
	}, 100);
})();
