// ==UserScript==
// @name           Wikipedia show Wikidata labels
// @namespace      sjorford@gmail.com
// @version        2023.10.05.0
// @author         Stuart Orford
// @match          https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_stadiums
// @grant          none
// @require        https://code.jquery.com/jquery-3.4.1.min.js
// @grant          GM_xmlhttpRequest
// @grant          GM.xmlhttpRequest
// @connect        wikidata.org
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-wikidata-label {display: none;}
		.sjo-wikidata-show .sjo-wikidata-label {display: inline-block;}
	</style>`).appendTo('head');
	
	var queue = [];
	
	var xxx = $('table.wikitable td > a').each((i,e) => {
		var pageTitle = e.href.match(/([^\/]+)(?:$|#)/)[1];
		queue.push({a: e, title: pageTitle});
	});
	
	console.log(xxx);
	
	console.log(queue);
	
	getNext();
	
	function getNext() {
		if (queue.length == 0) return;
		
		var next = queue.unshift();
		var url = `https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&normalize=1&titles=${next.title}`
		GM_xmlhttpRequest({url: url, responseType: 'json', onload: parse});
		//$.getJSON(url, parse);
		
		function parse(response) {
			var data = response.response;
			//var data = response;
			var pageKey = Object.keys(data.entities)[0];
			console.log(next.a, pageKey, next.title);
			//getNext();
		}
		
	}
	
});
})(jQuery);
