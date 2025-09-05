// ==UserScript==
// @name           Wikidata tweaks
// @namespace      sjorford@gmail.com
// @version        2024.07.06.1
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
				#sjo-wikipedia a {
					background-image: url(//upload.wikimedia.org/wikipedia/commons/thumb/6/63/Wikipedia-logo.png/35px-Wikipedia-logo.png);
					background-size: 20px;
					padding-left: 23px;
				}
				#sjo-dc a {
					background-image: url(https://dc-shared-frontend-assets.s3.eu-west-2.amazonaws.com/images/logo_icon.svg);
					background-size: 20px;
					padding-left: 23px;
				}
				.sjo-dc-logo {
					position: absolute; bottom: 10px; left: 10px; height: 50px;
				}
			</style>`).appendTo('head');
			
			$('div.wikibase-sitelinkgroupview:contains("(0 entries)")').not(':contains("Wikipedia")').hide();
			
			var enwiki = $('.wikibase-sitelinkview-enwiki a');
			if (enwiki.length > 0) {
				$(`<li id="sjo-wikipedia" class="mw-list-item"><a href="${enwiki.attr('href')}" title="${enwiki.text()}"><span>Wikipedia</span></a></li>`)
					.insertBefore('#ca-watch');
			}
			
			var dclinks = $('#P6465 .wikibase-statementview:not(.wb-deprecated) .wikibase-statementview-mainsnak a.wb-external-id');
			console.log(dclinks);
			if (dclinks.length == 1) {
				$(`<li id="sjo-dc" class="mw-list-item"><a href="${dclinks.attr('href')}" title="${dclinks.text()}"><span>Democracy Club</span></a></li>`)
					.insertBefore('#ca-watch');
				
			}
			
			$('<img class="sjo-dc-logo" src="https://dc-shared-frontend-assets.s3.eu-west-2.amazonaws.com/images/logo_icon.svg">')
				.appendTo('#P6465 .wikibase-statementgroupview-property');
			
		}
	}, 100);
})();
