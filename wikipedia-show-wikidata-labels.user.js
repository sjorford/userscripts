// ==UserScript==
// @name           Wikipedia show Wikidata labels
// @namespace      sjorford@gmail.com
// @version        2023.10.08.3
// @author         Stuart Orford
// @match          https://en.wikipedia.org/wiki/*
// @grant          GM_xmlhttpRequest
// @connect        wikidata.org
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-wikidata-label {font-size: smaller;}
	</style>`).appendTo('head');
	
	$('table.wikitable:contains("Capacity")').each((i,e) => {
		var table = $(e);
		
		// TODO: prettify button
		$('<button>Retrieve Wikidata IDs</button>').insertBefore(e).click(getWikidata);
		
		function getWikidata(event) {
			
			var queue = [];
			
			$('td a', table).each((i,e) => {
				var pageTitle = e.href.match(/([^\/]+)(?:$|#)/)[1];
				queue.push({a: e, title: pageTitle});
			});
			
			getNext();
			
			function getNext() {
				if (queue.length == 0) return;
				
				var next = queue.shift();
				var url = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&sites=enwiki&normalize=1&titles=${next.title}`
				GM_xmlhttpRequest({url: url, responseType: 'json', onload: parse});
				
				function parse(response) {
					console.log(response);
					var data = response.response;
					var pageKey = Object.keys(data.entities)[0];
					if (pageKey >= 0) {
						var newCells = $(next.a).closest('th, td').splitCell(2, 1);
						console.log(next.a, pageKey, next.title, newCells);
						newCells.last().append(`<span class="sjo-wikidata-label">${pageKey}</span>`);
					}
					getNext();
				}

			}

		}

	});
	
});
})(jQuery);
