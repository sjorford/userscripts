// ==UserScript==
// @name           LGBCE extract
// @namespace      sjorford@gmail.com
// @version        2022.07.07.0
// @author         Stuart Orford
// @match          https://www.lgbce.org.uk/all-reviews
// @grant          none
// @require        https://raw.githubusercontent.com/sjorford/js/master/sjo-jq.js
// ==/UserScript==

(function($) {
$(function() {
	
	$(`<style>
		.sjo-button {font-size: 1.4em;}
	</style>`).appendTo('head');
	
	var urls;
	
	$('<button class="sjo-button">Extract</button>').insertAfter('.group-header').click(extract);
	
	function extract() {
		$('.sjo-button').hide();
		createTable();
		urls = $('.reviews-block a').toArray().map(a => a.href);
		getNext();
	}
	
	function createTable() {
		var table = $('<table class="sjo-table"></table>').insertAfter('.group-header')
				.click(() => table.selectRange());
	}
	
	function getNext() {
		if (urls.length == 0) {
			console.log('done');
			return;
		}
		var url = urls.shift();
		console.log('getNext', url);
		$.get(url, parsePage);
	}
	
	function parsePage(data) {
		var council = $('h1', data).text().trim()
						.replace(/ (County Council|Council|Unitary Authority \(UA\))$/, '')
						.replace(/ & /, ' and ');
		var date = $('.field--name-field-review-dates td', data)
						.filter((i, e) => e.innerText.replace(/\s+/g, ' ').trim().match(/Final (report|recommendation)/i))
						.next('td').text().trim();
		var row = $('<tr></tr>').appendTo('.sjo-table');
		$('<td></td>').text(council).appendTo(row);
		$('<td style="text-align: right;"></td>').text(date).appendTo(row);
		getNext();
	}
	
});
})(jQuery);
